const React = require('react'); 

const Eye = () => React.createElement('svg', { 'data-testid': 'EyeIcon' });
const EyeOff = () => React.createElement('svg', { 'data-testid': 'EyeOffIcon' });
const Mail = () => React.createElement('svg', { 'data-testid': 'MailIcon' });
const Lock = () => React.createElement('svg', { 'data-testid': 'LockIcon' });
const ArrowRight = () => React.createElement('svg', { 'data-testid': 'ArrowRightIcon' });
const ArrowLeft = () => React.createElement('svg', { 'data-testid': 'ArrowLeftIcon' });
const CheckCircle = () => React.createElement('svg', { 'data-testid': 'CheckCircleIcon' });
const User = () => React.createElement('svg', { 'data-testid': 'UserIcon' });

module.exports = {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  User,
};