import { supabase } from '../lib/supabase'

export const authService = {
  async signUp({ email, password, firstName, lastName }) {
    try {
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
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      
      if (data.user) {
        try {
          const profileResult = await this.createUserProfile({
            userId: data.user.id,
            firstName,
            lastName
          });
          
          if (profileResult.success) {
          } else {
          }
        } catch (profileError) {
        }
      }
      
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async signIn({ email, password }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async signInAnonymously() {
    try {
      
      const { data, error } = await supabase.auth.signInAnonymously()
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async createUserProfile({ userId, firstName, lastName }) {
    try {
      
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
        return { success: false, error: error.message };
      }
      
      return { success: true, profile: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getUserProfile(userId) {
    try {
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, profile: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateUserProfile(userId, updates) {
    try {
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, profile: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
} 