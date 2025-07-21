import { supabase } from '../lib/supabase'

export const authService = {
  // Sign up with email and password
  async signUp({ email, password, firstName, lastName }) {
    try {
      console.log('🚀 Starting signup process...');
      console.log('📧 Email:', email);
      console.log('🔒 Password length:', password.length);
      console.log('👤 First name:', firstName);
      console.log('👤 Last name:', lastName);
      
      console.log('👤 Creating user account in auth.users table...');
      
      // Create the user account with metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`
          }
        }
      })
      
      console.log('📊 Auth signup response received');
      console.log('📊 Response data:', data);
      console.log('📊 Response error:', error);
      
      if (error) {
        console.error('❌ Auth signup error occurred');
        console.error('❌ Error message:', error.message);
        console.error('❌ Error status:', error.status);
        
        return { success: false, error: error.message };
      }
      
      console.log('✅ User created successfully in auth.users table');
      console.log('🆔 User ID (UUID):', data.user?.id);
      console.log('📧 User email:', data.user?.email);
      console.log('✅ Email confirmed:', data.user?.email_confirmed_at);
      console.log('📅 Created at:', data.user?.created_at);
      console.log('🔐 Session:', data.session ? 'Created' : 'Not created');
      
      // If user was created successfully, create their profile
      if (data.user) {
        try {
          console.log('👤 Creating user profile...');
          const profileResult = await this.createUserProfile({
            userId: data.user.id,
            firstName,
            lastName
          });
          
          if (profileResult.success) {
            console.log('✅ Profile created successfully');
          } else {
            console.warn('⚠️ Profile creation failed:', profileResult.error);
            // Don't fail the signup if profile creation fails
          }
        } catch (profileError) {
          console.warn('⚠️ Profile creation exception:', profileError);
          // Don't fail the signup if profile creation fails
        }
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('💥 Signup process failed with exception');
      console.error('💥 Exception message:', error.message);
      return { success: false, error: error.message }
    }
  },

  // Sign in with email and password
  async signIn({ email, password }) {
    try {
      console.log('🔐 Starting signin process...');
      console.log('📧 Email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('❌ Signin failed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Signin successful for user:', data.user?.id);
      return { success: true, data }
    } catch (error) {
      console.error('❌ Signin failed:', error);
      return { success: false, error: error.message }
    }
  },

  // Sign in anonymously (guest mode)
  async signInAnonymously() {
    try {
      console.log('👤 Starting anonymous signin process...');
      
      const { data, error } = await supabase.auth.signInAnonymously()
      
      if (error) {
        console.error('❌ Anonymous signin failed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Anonymous signin successful for user:', data.user?.id);
      return { success: true, data }
    } catch (error) {
      console.error('❌ Anonymous signin failed:', error);
      return { success: false, error: error.message }
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ Signout failed:', error);
        return { success: false, error: error.message };
      }
      console.log('✅ Signout successful');
      return { success: true }
    } catch (error) {
      console.error('❌ Signout failed:', error);
      return { success: false, error: error.message }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('❌ Get current user failed:', error);
        return { success: false, error: error.message };
      }
      return { success: true, user }
    } catch (error) {
      console.error('❌ Get current user failed:', error);
      return { success: false, error: error.message }
    }
  },

  // Create user profile
  async createUserProfile({ userId, firstName, lastName }) {
    try {
      console.log('👤 Creating profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`
        })
        .select()
        .single()
      
      if (error) {
        console.error('❌ Profile creation failed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Profile created successfully:', data);
      return { success: true, profile: data };
    } catch (error) {
      console.error('❌ Profile creation exception:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {
      console.log('👤 Getting profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('❌ Get profile failed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Profile retrieved successfully:', data);
      return { success: true, profile: data };
    } catch (error) {
      console.error('❌ Get profile exception:', error);
      return { success: false, error: error.message };
    }
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      console.log('👤 Updating profile for user:', userId);
      console.log('📝 Updates:', updates);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Profile update failed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Profile updated successfully:', data);
      return { success: true, profile: data };
    } catch (error) {
      console.error('❌ Profile update exception:', error);
      return { success: false, error: error.message };
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
} 