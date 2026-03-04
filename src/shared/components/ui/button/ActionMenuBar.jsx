const ActionMenuBar = ({ controlMenus = [], functionMenus = [] }) => {
  if (!controlMenus.length && !functionMenus.length) return null;

  return (
    <div className="flex items-center gap-2">
      {controlMenus.map((menu) => (
        <button
          key={menu.key}
          onClick={menu.onClick}
          className={`px-3 py-1 text-sm rounded ${menu.active ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          {menu.label}
        </button>
      ))}
      {functionMenus.map((menu) => (
        <button
          key={menu.key}
          onClick={menu.onClick}
          className="px-3 py-1 text-sm rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          {menu.label}
        </button>
      ))}
    </div>
  );
};

export default ActionMenuBar;
