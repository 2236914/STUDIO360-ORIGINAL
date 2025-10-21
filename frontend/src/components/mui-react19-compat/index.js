// React 19 compatible MUI component wrappers
// These components replace MUI components that use Portal with ref issues

export { CustomDrawer as Drawer } from '../custom-drawer';
export { CustomPopoverReact19 as Popover } from '../custom-popover/custom-popover-react19';

// For components we haven't replaced yet, use the original
export { 
  Menu,
  Modal,
  Dialog,
  Tooltip,
  MenuList,
  MenuItem
} from '@mui/material';
