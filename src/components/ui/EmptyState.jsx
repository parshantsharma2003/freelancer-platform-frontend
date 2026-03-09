import { motion } from 'framer-motion';
import { FileQuestion, Search, Inbox, AlertCircle, Package, Users } from 'lucide-react';
import Button from './Button';

/**
 * EmptyState Component - Beautiful empty states for lists and data views
 */
const EmptyState = ({
  icon: CustomIcon,
  iconType = 'default',
  title,
  description,
  action,
  actionLabel,
  secondaryAction,
  secondaryActionLabel,
  size = 'md',
  className = '',
}) => {
  // Icon presets
  const iconPresets = {
    default: FileQuestion,
    search: Search,
    inbox: Inbox,
    error: AlertCircle,
    package: Package,
    users: Users,
  };

  const Icon = CustomIcon || iconPresets[iconType] || iconPresets.default;

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'py-8',
      iconWrapper: 'w-16 h-16 mb-4',
      iconSize: 32,
      title: 'text-lg',
      description: 'text-sm',
      buttonSize: 'sm',
    },
    md: {
      container: 'py-12',
      iconWrapper: 'w-20 h-20 mb-6',
      iconSize: 40,
      title: 'text-xl',
      description: 'text-base',
      buttonSize: 'md',
    },
    lg: {
      container: 'py-16',
      iconWrapper: 'w-24 h-24 mb-8',
      iconSize: 48,
      title: 'text-2xl',
      description: 'text-lg',
      buttonSize: 'lg',
    },
  };

  const config = sizeConfig[size];

  return (
    <motion.div
      className={`flex flex-col items-center justify-center text-center ${config.container} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Icon with animation */}
      <motion.div
        className={`${config.iconWrapper} bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center relative`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: 'spring',
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
      >
        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 bg-primary-200 rounded-full"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ 
            scale: [1, 1.3, 1.3],
            opacity: [0.5, 0, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
        
        <Icon size={config.iconSize} className="text-slate-400 relative z-10" strokeWidth={1.5} />
      </motion.div>

      {/* Title */}
      <motion.h3
        className={`font-semibold text-slate-900 mb-2 ${config.title}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          className={`text-slate-600 mb-6 max-w-md ${config.description}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {description}
        </motion.p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {action && (
            <Button
              size={config.buttonSize}
              variant="primary"
              onClick={action}
            >
              {actionLabel || 'Take Action'}
            </Button>
          )}
          {secondaryAction && (
            <Button
              size={config.buttonSize}
              variant="outline"
              onClick={secondaryAction}
            >
              {secondaryActionLabel || 'Learn More'}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

// Preset empty states for common scenarios
export const NoJobsFound = ({ action, actionLabel }) => (
  <EmptyState
    iconType="search"
    title="No jobs found"
    description="We couldn't find any jobs matching your criteria. Try adjusting your filters or check back later."
    action={action}
    actionLabel={actionLabel || 'Browse All Jobs'}
  />
);

export const NoProposalsYet = ({ action, actionLabel }) => (
  <EmptyState
    iconType="inbox"
    title="No proposals yet"
    description="You haven't submitted any proposals. Start browsing jobs and submit your first proposal today."
    action={action}
    actionLabel={actionLabel || 'Browse Jobs'}
  />
);

export const NoMessagesYet = ({ action, actionLabel }) => (
  <EmptyState
    iconType="inbox"
    title="No messages yet"
    description="Your inbox is empty. Start a conversation with clients or freelancers."
    action={action}
    actionLabel={actionLabel || 'Browse Jobs'}
  />
);

export const NoContractsYet = ({ action, actionLabel }) => (
  <EmptyState
    iconType="package"
    title="No contracts yet"
    description="You don't have any active contracts. Start working on projects to see them here."
    action={action}
    actionLabel={actionLabel || 'Find Work'}
  />
);

export const NoFreelancersFound = ({ action, actionLabel }) => (
  <EmptyState
    iconType="users"
    title="No freelancers found"
    description="We couldn't find any freelancers matching your criteria. Try adjusting your search."
    action={action}
    actionLabel={actionLabel || 'View All Freelancers'}
  />
);

export const NoNotifications = () => (
  <EmptyState
    iconType="inbox"
    title="All caught up!"
    description="You don't have any new notifications right now."
    size="sm"
  />
);

export const ErrorState = ({ title, description, action, actionLabel }) => (
  <EmptyState
    iconType="error"
    title={title || 'Something went wrong'}
    description={description || 'An error occurred while loading this content. Please try again.'}
    action={action}
    actionLabel={actionLabel || 'Retry'}
  />
);

export default EmptyState;
