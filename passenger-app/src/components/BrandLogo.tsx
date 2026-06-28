import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';

interface BrandLogoProps {
  size?: number;
  primaryColor?: string;
  accentColor?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 120,
  primaryColor = '#16A34A',
  accentColor = '#0EA5E9',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <LinearGradient id="cabinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={primaryColor} />
          <Stop offset="100%" stopColor="#15803D" />
        </LinearGradient>
        <LinearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0EA5E9" />
          <Stop offset="100%" stopColor="#10B981" />
        </LinearGradient>
      </Defs>

      {/* Main E-Rickshaw Cabin Body */}
      <Path
        d="M20,25 
           C20,25 32,22 45,22 
           C58,22 70,28 72,40 
           L75,50 
           C76,54 74,58 70,58 
           L25,58 
           C20,58 16,54 16,48 
           L16,33 
           C16,28 20,25 20,25 Z"
        fill="url(#cabinGrad)"
      />

      {/* Windshield cut outline */}
      <Path
        d="M52,25 L66,38 H52 Z"
        fill="#FFFFFF"
        opacity="0.25"
      />

      {/* Chassis and Wheel Fork */}
      <Path
        d="M70,58 L80,72"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Path
        d="M20,58 L20,72"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Back Wheel */}
      <Circle cx="20" cy="74" r="10" fill="#1E293B" stroke="#FFFFFF" strokeWidth="2.5" />
      <Circle cx="20" cy="74" r="4" fill={accentColor} />

      {/* Front Wheel */}
      <Circle cx="80" cy="74" r="10" fill="#1E293B" stroke="#FFFFFF" strokeWidth="2.5" />
      <Circle cx="80" cy="74" r="4" fill={accentColor} />

      {/* Minimalist Lightning Bolt overlapping/cutout */}
      <G transform="translate(10, 4)">
        <Path
          d="M32,18 L18,40 H28 L20,60 L42,34 H30 L35,18 Z"
          fill="url(#boltGrad)"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
};

export default BrandLogo;
