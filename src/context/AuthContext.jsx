import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { authAPI, adminAPI } from '../services/api';

const AuthContext = createContext(null);

// Action types
export const AUTH_ACTIONS = {
  INIT_AUTH: 'INIT_AUTH',
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_AUTH_RESOLVED: 'SET_AUTH_RESOLVED',
};

// Initial state
const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isAuthResolved: false,
  error: null,
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.INIT_AUTH:
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: !!action.payload.user,
        isAuthResolved: true,
      };

    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        isAuthResolved: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isAuthResolved: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload.user,
      };

    case AUTH_ACTIONS.SET_AUTH_RESOLVED:
      return {
        ...state,
        isAuthResolved: true,
      };

    default:
      return state;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const clearStoredAuth = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  // Initialize auth from secure cookies first, then sync local access token.
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      const hasStoredAccessToken = !!(
        accessToken &&
        accessToken !== 'undefined' &&
        accessToken !== 'null'
      );
      const hasStoredUser = !!(user && user !== 'undefined' && user !== 'null');

      try {
        const sessionResponse = await authAPI.session({ skipAuthRefresh: true });
        const sessionData = sessionResponse?.data?.data || {};
        const verifiedUser = sessionData.authenticated ? sessionData.user || null : null;

        if (verifiedUser) {
          const accessToken = sessionData.accessToken || localStorage.getItem('accessToken') || null;

          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
          } else {
            localStorage.removeItem('accessToken');
          }

          localStorage.setItem('user', JSON.stringify(verifiedUser));

          dispatch({
            type: AUTH_ACTIONS.INIT_AUTH,
            payload: {
              accessToken,
              refreshToken: null,
              user: verifiedUser,
            },
          });
        } else {
          clearStoredAuth();
          dispatch({ type: AUTH_ACTIONS.SET_AUTH_RESOLVED });
        }
      } catch (error) {
        clearStoredAuth();
        dispatch({ type: AUTH_ACTIONS.SET_AUTH_RESOLVED });
      }
    };

    initializeAuth();

    // Listen for auth:logout custom event from interceptor
    const handleAuthLogout = () => {
      clearStoredAuth();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    };

    window.addEventListener('auth:logout', handleAuthLogout);

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []);

  // Login function
  const login = useCallback(
    async (credentials) => {
      // Prevent duplicate login requests
      if (state.isLoading) {
        return { success: false, error: 'Login in progress' };
      }

      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      try {
        const response = await authAPI.login(credentials);
        const { user, accessToken } = response?.data?.data || {};

        if (!user) {
          throw new Error('Invalid login response');
        }

        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        } else {
          localStorage.removeItem('accessToken');
        }

        localStorage.removeItem('refreshToken');
        localStorage.setItem('user', JSON.stringify(user));

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, accessToken, refreshToken: null },
        });

        return { success: true, user };
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Login failed';
        const errorData = error.response?.data?.data || {};
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: { error: errorMsg },
        });
        return {
          success: false,
          error: errorMsg,
          requiresEmailVerification: !!errorData.requiresEmailVerification,
          verificationMethod: errorData.verificationMethod || null,
          email: errorData.email || credentials?.email || ''
        };
      }
    },
    [state.isLoading]
  );

  // Register function
  const register = useCallback(
    async (credentials) => {
      // Prevent duplicate registration requests
      if (state.isLoading) {
        return { success: false, error: 'Registration in progress' };
      }

      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      try {
        const response = await authAPI.register(credentials);
        const { user, accessToken, requiresEmailVerification, verificationUrl, email } = response?.data?.data || {};

        if (requiresEmailVerification) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          dispatch({ type: AUTH_ACTIONS.LOGOUT });

          return {
            success: true,
            requiresEmailVerification: true,
            user: user || null,
            email: email || credentials?.email || '',
            verificationUrl,
          };
        }

        if (!user) {
          throw new Error('Invalid registration response');
        }

        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        } else {
          localStorage.removeItem('accessToken');
        }

        localStorage.removeItem('refreshToken');
        localStorage.setItem('user', JSON.stringify(user));

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, accessToken, refreshToken: null },
        });

        return { success: true, user };
      } catch (error) {
        const responseData = error.response?.data || {};
        const errorData = responseData?.data || {};
        const validationErrors = Array.isArray(responseData?.errors) ? responseData.errors : [];
        const errorMsg =
          validationErrors[0]?.message ||
          responseData?.message ||
          'Registration failed';
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: { error: errorMsg },
        });
        return {
          success: false,
          error: errorMsg,
          validationErrors,
          requiresEmailVerification: !!errorData.requiresEmailVerification,
          verificationMethod: errorData.verificationMethod || null,
          email: errorData.email || credentials?.email || '',
          verificationOtp: errorData.verificationOtp || null
        };
      }
    },
    [state.isLoading]
  );

  // Admin Login function (separate endpoint)
  const adminLogin = useCallback(
    async (credentials) => {
      // Prevent duplicate admin login requests
      if (state.isLoading) {
        return { success: false, error: 'Login in progress' };
      }

      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      try {
        const response = await adminAPI.login(credentials);
        const { user, accessToken } = response?.data?.data || {};

        // Verify super admin role
        if (user?.role !== 'super_admin') {
          const errorMsg = 'Access denied. Super Admin only.';
          dispatch({
            type: AUTH_ACTIONS.LOGIN_FAILURE,
            payload: { error: errorMsg },
          });
          return { success: false, error: errorMsg };
        }

        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        } else {
          localStorage.removeItem('accessToken');
        }

        localStorage.removeItem('refreshToken');
        localStorage.setItem('user', JSON.stringify(user));

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, accessToken, refreshToken: null },
        });

        return { success: true, user };
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Admin login failed';
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: { error: errorMsg },
        });
        return { success: false, error: errorMsg };
      }
    },
    [state.isLoading]
  );

  const otpLogin = useCallback(
    async ({ email, otp }) => {
      if (state.isLoading) {
        return { success: false, error: 'Login in progress' };
      }

      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      try {
        const response = await authAPI.verifyLoginOtp(email, otp);
        const { user, accessToken } = response?.data?.data || {};

        if (!user) {
          throw new Error('Invalid OTP login response');
        }

        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        } else {
          localStorage.removeItem('accessToken');
        }

        localStorage.removeItem('refreshToken');
        localStorage.setItem('user', JSON.stringify(user));

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, accessToken, refreshToken: null },
        });

        return { success: true, user };
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'OTP login failed';
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: { error: errorMsg },
        });
        return { success: false, error: errorMsg };
      }
    },
    [state.isLoading]
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // Local cleanup still happens even if the network request fails.
    } finally {
      clearStoredAuth();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  // Update user
  const updateUser = useCallback((user) => {
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: { user },
    });
  }, []);

  const value = {
    ...state,
    login,
    register,
    adminLogin,
    otpLogin,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
