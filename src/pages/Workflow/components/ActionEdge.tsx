import React from 'react';
import {EdgeProps, getBezierPath} from '@xyflow/react';
import {Icon} from 'air-design';

const ActionEdge: React.FC<EdgeProps> = ({
                                           id,
                                           sourceX,
                                           sourceY,
                                           targetX,
                                           targetY,
                                           sourcePosition,
                                           targetPosition,
                                           style = {},
                                           markerEnd,
                                         }) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
      <>
        <path
            id={id}
            style={style}
            className="react-flow__edge-path"
            d={edgePath}
            markerEnd={markerEnd}
        />
        <foreignObject
            width={16}
            height={16}
            x={labelX - 8}
            y={labelY - 8}
        >
          <div>
            <Icon name="close" size={16}/>
          </div>
        </foreignObject>
      </>
  );
};

export default ActionEdge;
