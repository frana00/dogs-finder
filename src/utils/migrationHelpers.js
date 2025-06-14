/**
 * Migration helpers for updating user data structure
 */
import { getUserData, saveUserData, getCredentials, getUserDataForUser, saveUserDataForUser } from './storage';
import { fetchUserFromApi } from '../services/auth';

/**
 * Migrates user data to use single email field
 * This fixes users who might have placeholder emails instead of their real email
 */
export const migrateUserEmailData = async () => {
  try {
    console.log('🔄 Starting email data migration...');
    
    const credentials = await getCredentials();
    if (!credentials) {
      console.log('❌ No credentials found, skipping migration');
      return { migrated: false, hadPlaceholder: false };
    }

    const userData = await getUserDataForUser(credentials.username);
    if (!userData) {
      console.log('❌ No user data found, skipping migration');
      return { migrated: false, hadPlaceholder: false };
    }

    // Check if user has placeholder email that needs to be fixed
    const hasPlaceholderEmail = userData.email === 'tu@email.com' || 
                               userData.email === 'test@example.com' ||
                               !userData.email ||
                               userData.email.trim() === '';

    if (hasPlaceholderEmail) {
      console.log('⚠️ Found user with placeholder/empty email, attempting to fetch real email from API...');
      console.log('Current user data:', userData);
      
      // Try to get real email from backend
      try {
        const apiUser = await fetchUserFromApi(credentials.username);
        
        if (apiUser && apiUser.email && apiUser.email.trim() !== '') {
          console.log('✅ Successfully fetched real email from API:', apiUser.email);
          
          const updatedUserData = {
            ...userData,
            email: apiUser.email,
            phoneNumber: apiUser.phoneNumber || userData.phoneNumber || '',
            subscriptionEmail: apiUser.subscriptionEmail || apiUser.email,
            updatedAt: new Date().toISOString(),
            migrated: true,
          };

          await saveUserDataForUser(credentials.username, updatedUserData);
          await saveUserData(updatedUserData);
          
          console.log('✅ User data migrated successfully with real email from API');
          return { migrated: true, hadPlaceholder: false }; // No need to show alert since we got real email
        } else {
          console.log('⚠️ Could not fetch email from API, leaving empty for manual update');
        }
      } catch (apiError) {
        console.log('⚠️ API fetch failed during migration:', apiError.message);
      }
      
      // If API fetch failed, still mark as migrated but indicate placeholder was found
      const updatedUserData = {
        ...userData,
        email: '', // Clear placeholder email
        subscriptionEmail: '', // Clear notification email
        updatedAt: new Date().toISOString(),
        migrated: true, // Mark as migrated
      };

      await saveUserDataForUser(credentials.username, updatedUserData);
      await saveUserData(updatedUserData);
      
      console.log('✅ User data migrated, but manual email update needed');
      return { migrated: true, hadPlaceholder: true };
    } else {
      // Ensure subscriptionEmail matches primary email
      if (userData.subscriptionEmail !== userData.email) {
        const updatedUserData = {
          ...userData,
          subscriptionEmail: userData.email, // Sync notification email with primary
          updatedAt: new Date().toISOString(),
          migrated: true,
        };

        await saveUserDataForUser(credentials.username, updatedUserData);
        await saveUserData(updatedUserData);
        
        console.log('✅ Synchronized notification email with primary email');
        return { migrated: true, hadPlaceholder: false };
      }
    }

    console.log('✅ No migration needed, user data is correct');
    return { migrated: false, hadPlaceholder: false };
  } catch (error) {
    console.error('❌ Error during email migration:', error);
    return { migrated: false, error: error.message };
  }
};

/**
 * Checks if user needs email migration
 */
export const checkIfMigrationNeeded = async () => {
  try {
    const credentials = await getCredentials();
    if (!credentials) return false;

    const userData = await getUserDataForUser(credentials.username);
    if (!userData) return false;

    // Check if already migrated
    if (userData.migrated) return false;

    // Check if has placeholder email or mismatched emails
    const hasPlaceholderEmail = userData.email === 'tu@email.com' || 
                               userData.email === 'test@example.com' ||
                               !userData.email ||
                               userData.email.trim() === '';

    const hasMismatchedEmails = userData.subscriptionEmail !== userData.email;

    return hasPlaceholderEmail || hasMismatchedEmails;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
};
