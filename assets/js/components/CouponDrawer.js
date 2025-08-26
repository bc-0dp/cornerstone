import React from 'react';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import VerticalStepper from './VerticalStepper';

export default function CouponDrawer() {
  const [state, setState] = React.useState({
    right: false,
  });

  const toggleDrawer = (side, open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }

    setState((prevState) => ({ ...prevState, [side]: open }));
  };

  return (
    <div>
      <Button
        color="secondary"
        variant="contained"
        onClick={toggleDrawer('right', true)}
        aria-label="Open coupon drawer"
      >
        Click Here For A Coupon
      </Button>
      <Drawer
        anchor="right"
        open={state.right}
        onClose={toggleDrawer('right', false)}
      >
        <Box sx={{ width: 320, p: 2 }}>
          <VerticalStepper />
        </Box>
      </Drawer>
    </div>
  );
}
