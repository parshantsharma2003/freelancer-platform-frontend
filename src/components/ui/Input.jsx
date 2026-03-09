import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { AlertCircle } from 'lucide-react';

/**
 * Input Component - Text input with validation states and icons
 */
const Input = forwardRef(({
  label,
  error,
  helper,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  className = '',
  containerClassName = '',
  type = 'text',
  ...props
}, ref) => {
  const baseInputStyles = 'block px-4 py-2.5 text-gray-900 bg-white border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:cursor-not-allowed';

  const stateStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200';

  const inputClassName = clsx(
    baseInputStyles,
    stateStyles,
    icon && iconPosition === 'left' && 'pl-11',
    icon && iconPosition === 'right' && 'pr-11',
    fullWidth && 'w-full',
    className
  );

  return (
    <div className={clsx('relative', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="h-5 w-5 text-gray-400">{icon}</span>
          </div>
        )}

        <input
          ref={ref}
          type={type}
          className={inputClassName}
          {...props}
        />

        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="h-5 w-5 text-gray-400">{icon}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center mt-1.5 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>{error}</span>
        </div>
      )}

      {helper && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
