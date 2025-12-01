import React from 'react';

const ParkingLotActions = ({ parkingLot, onDelete, onManage }) => {
  const actions = [
    { 
      label: 'Manage', 
      onClick: () => onManage(parkingLot), 
      className: 'btn btn-primary btn-sm me-2',
      title: 'Manage parking lot'
    },
    { 
      label: 'Delete', 
      onClick: () => onDelete(parkingLot), 
      className: 'btn btn-danger btn-sm',
      title: 'Delete parking lot'
    }
  ];

  return (
    <div className="parking-lot-actions d-flex">
      {actions.map((action, index) => (
        <button 
          key={index}
          onClick={action.onClick}
          className={action.className}
          title={action.title}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default ParkingLotActions;
