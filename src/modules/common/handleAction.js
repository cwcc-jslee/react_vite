// handle actiopn 관련

// menu button action 관련
export const getDrawerData = (value, path) => {
  if (value.action === 'DRAWER') {
    let changeDrawer = {};
    console.log(`>>>>`, value);
    const drawer = value.drawer;
    if (drawer.action === 'add') {
      changeDrawer.path = path;
      changeDrawer.loading = false;
      changeDrawer = { ...changeDrawer, ...value.drawer, open: true };
    }
    if (drawer.action === 'view') {
      changeDrawer.path = path;
      changeDrawer.loading = false;
      changeDrawer = { ...changeDrawer, ...value.drawer, open: true };
    }
    // console.log(`>>>>`, changeDrawer);
    return changeDrawer;
  }
};
