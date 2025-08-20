import React from "react";

const PopupDashboard = () => {
  return (
    <div
      id="app-setting-drawer"
      className="fixed top-0 right-0 z-modal h-screen p-4 rounded-l-15 border-l-2 border-primary-400 overflow-y-auto transition-transform translate-x-full bg-white w-[calc(theme('spacing.app-menu')_*_1.1)] dark:bg-gray-800"
      tabIndex={-1}
    >
      <h5 className="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-dark-text">
        Customize Option
      </h5>
      <button
        type="button"
        data-drawer-hide="app-setting-drawer"
        aria-controls="app-setting-drawer"
        className="hover:bg-gray-200 rounded-lg size-8 absolute top-2.5 end-2.5 flex-center dark:hover:bg-gray-600"
      >
        <i className="ri-close-line text-gray-500 dark:text-dark-text" />
      </button>
      <p className="mb-6 text-sm text-gray-500 dark:text-dark-text">
        Customize Your Theme as you like !
      </p>
    </div>
  );
};

export default PopupDashboard;
