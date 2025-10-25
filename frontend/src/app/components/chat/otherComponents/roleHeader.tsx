import React from "react";

interface RoleHeaderProps {
  roleName: string;
  roleCount: number;
}

const RoleHeader: React.FC<RoleHeaderProps> = ({ roleName, roleCount }) => {
  return (
    <div className="label">
      <span className="label-text text-black font-bold opacity-60">
        {roleName} - {roleCount}
      </span>
    </div>
  );
};

export default RoleHeader;
