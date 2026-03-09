import { motion } from 'framer-motion';
import { clsx } from 'clsx';

/**
 * Card Component - Flexible card container with hover effects
 */
const Card = ({
  children,
  variant = 'default',
  hoverable = false,
  clickable = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'bg-white rounded-xl transition-all duration-200';

  const variants = {
    default: 'border border-gray-200 shadow-sm',
    elevated: 'shadow-md',
    outline: 'border-2 border-gray-200',
    flat: 'border border-gray-100',
  };

  const interactiveStyles = (hoverable || clickable) && 'hover:shadow-lg hover:border-primary-200';
  const cursorStyles = clickable && 'cursor-pointer';

  const combinedClassName = clsx(
    baseStyles,
    variants[variant],
    interactiveStyles,
    cursorStyles,
    className
  );

  if (clickable) {
    return (
      <motion.div
        className={combinedClassName}
        onClick={onClick}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={combinedClassName}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Sub-components
 */
Card.Header = ({ children, className = '' }) => (
  <div className={clsx('px-6 py-4 border-b border-gray-100', className)}>
    {children}
  </div>
);

Card.Body = ({ children, className = '' }) => (
  <div className={clsx('px-6 py-4', className)}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '' }) => (
  <div className={clsx('px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl', className)}>
    {children}
  </div>
);

export default Card;
