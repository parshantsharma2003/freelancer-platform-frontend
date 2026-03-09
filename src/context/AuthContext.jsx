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
        isAuthenticated: !!action.payload.accessToken,
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

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        const storedRefreshToken = localStorage.getItem('refreshToken');

        if (storedToken && storedUser) {
          try {
            const response = await authAPI.getMe();
            const verifiedUser = response.data?.data?.user;

            if (!verifiedUser) {
              throw new Error('Unable to verify user session');
            }

            localStorage.setItem('user', JSON.stringify(verifiedUser));

            dispatch({
              type: AUTH_ACTIONS.INIT_AUTH,
              payload: {
                accessToken: storedToken,
                refreshToken: storedRefreshToken,
                user: verifiedUser,
              },
            });
          } catch (error) {
            // Token expired or invalid, logout
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        } else {
          // No stored token, mark auth as resolved
          dispatch({ type: AUTH_ACTIONS.SET_AUTH_RESOLVED });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: AUTH_ACTIONS.SET_AUTH_RESOLVED });
      }
    };

    initializeAuth();

    // Listen for auth:logout custom event from interceptor
    const handleAuthLogout = () => {
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
        // Backend returns data in response.data.data structure
        const { user, accessToken, refreshToken } = response.data.data;

        // Save to localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        // Update context state - sets isAuthenticated and isAuthResolved
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, accessToken, refreshToken },
        });

        return { success: true, user };
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Login failed';
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: { error: errorMsg },
        });
        return { success: false, error: errorMsg };
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
        const { user, accessToken, refreshToken } = response.data.data;

        // Save to localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        // Update context state
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, accessToken, refreshToken },
        });

        return { success: true, user };
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Registration failed';
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: { error: errorMsg },
        });
        return { success: false, error: errorMsg };
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
        const { user, accessToken, refreshToken } = response.data.data;

        // Verify super admin role
        if (user?.role !== 'super_admin') {
          const errorMsg = 'Access denied. Super Admin only.';
          dispatch({
            type: AUTH_ACTIONS.LOGIN_FAILURE,
            payload: { error: errorMsg },
          });
          return { success: false, error: errorMsg };
        }

        // Save to localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        // Update context state
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, accessToken, refreshToken },
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

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
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
