import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Types
type Prize = {
  id: number;
  value: number;
  label: string;
  color: string;
  probability: number;
};

interface WheelProps {
  segments: Prize[];
  rotation: number;
  isSpinning: boolean;
  isFirstSpin: boolean;
}

// Styled components
const WheelSVG = styled(motion.div)`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const WheelCenter = styled.div`
  position: absolute;
  width: 50px;
  height: 50px;
  background: gold;
  border-radius: 50%;
  z-index: 2;
  box-shadow: 
    0 0 10px gold,
    inset 0 0 5px rgba(255, 255, 255, 0.5);
`;

const SegmentLabel = styled.text`
  font-size: 14px;
  font-weight: bold;
  fill: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  text-anchor: middle;
`;

// Helper functions
const degreesToRadians = (degrees: number) => {
  return degrees * Math.PI / 180;
};

const Wheel: React.FC<WheelProps> = ({ segments, rotation, isSpinning, isFirstSpin }) => {
  const numSegments = segments.length;
  const segmentAngle = 360 / numSegments;
  const radius = 200; // SVG radius
  
  const renderSegments = () => {
    return segments.map((segment, index) => {
      // Calculate the angles for this segment
      const startAngle = index * segmentAngle;
      const endAngle = (index + 1) * segmentAngle;
      
      // Convert to radians
      const startRad = degreesToRadians(startAngle);
      const endRad = degreesToRadians(endAngle);
      
      // Calculate SVG arc path
      // SVG arcs use the following format:
      // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
      const x1 = radius + radius * Math.cos(startRad);
      const y1 = radius + radius * Math.sin(startRad);
      const x2 = radius + radius * Math.cos(endRad);
      const y2 = radius + radius * Math.sin(endRad);
      
      // Path for the segment
      const path = [
        `M ${radius} ${radius}`, // Move to center
        `L ${x1} ${y1}`, // Line to outer edge at start angle
        `A ${radius} ${radius} 0 0 1 ${x2} ${y2}`, // Arc to end angle
        'Z' // Close path
      ].join(' ');
      
      // Calculate position for the label
      const labelAngle = startAngle + (segmentAngle / 2);
      const labelRad = degreesToRadians(labelAngle);
      const labelDistance = radius * 0.7; // 70% from center
      const labelX = radius + labelDistance * Math.cos(labelRad);
      const labelY = radius + labelDistance * Math.sin(labelRad);
      
      // Rotate label to be readable
      let labelRotation = labelAngle;
      if (labelAngle > 90 && labelAngle < 270) {
        labelRotation += 180; // Flip text if it would be upside down
      }
      
      return (
        <g key={segment.id}>
          <path
            d={path}
            fill={segment.color}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1"
          />
          <SegmentLabel
            x={labelX}
            y={labelY}
            transform={`rotate(${labelRotation}, ${labelX}, ${labelY})`}
          >
            {segment.label}
          </SegmentLabel>
        </g>
      );
    });
  };
  
  return (
    <WheelSVG
      animate={{
        rotate: rotation,
        transition: {
          type: "spring",
          duration: isFirstSpin ? 8 : 3,
          bounce: 0.25
        }
      }}
      style={{
        originX: 0.5,
        originY: 0.5,
        borderRadius: "50%",
        overflow: "hidden",
        boxShadow: "0 0 30px rgba(0, 0, 0, 0.5)"
      }}
    >
      <svg
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        width="100%"
        height="100%"
      >
        {renderSegments()}
      </svg>
      <WheelCenter />
    </WheelSVG>
  );
};

export default Wheel; 