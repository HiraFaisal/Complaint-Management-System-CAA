import React from 'react';
import PropTypes from 'prop-types';

const ComplaintBox = ({ number = 0, title, onClick }) => {
  return (
    <div
      className="group before:hover:scale-95 before:hover:h-60 before:hover:w-64 before:hover:h-44 before:hover:rounded-b-2xl before:transition-all before:duration-500 before:content-[''] before:w-80 before:h-24 before:rounded-t-2xl before:bg-gradient-to-bl from-blue-400 via-blue-200 to-blue-700 before:absolute before:top-0 w-64 h-60 relative bg-slate-50 flex flex-col items-center justify-center gap-2 text-center rounded-2xl overflow-hidden m-4"
      onClick={onClick}
    >
      <div className="w-20 h-20 bg-blue-700 mt-8 rounded-full border-4 border-slate-50 z-10 group-hover:scale-150 group-hover:-translate-x-24 group-hover:-translate-y-20 transition-all duration-500 text-white flex justify-center items-center text-2xl font-semibold">
        {number}
      </div>
      <div className="z-10 group-hover:-translate-y-10 transition-all duration-500">
        <span className="text-2xl font-inherit font-semibold text-sky-950">
          {title}
        </span>
      </div>
      <a
        className="bg-blue-700 px-4 py-1 text-slate-50 rounded-md z-10 hover:scale-125 transition-all duration-500 hover:bg-blue-600"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onClick(title);
        }}
      >
        View Details
      </a>
    </div>
  );
};

ComplaintBox.propTypes = {
  number: PropTypes.number,
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ComplaintBox;
