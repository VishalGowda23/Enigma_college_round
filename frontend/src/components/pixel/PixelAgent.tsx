import React from 'react'
import type { ActorRole } from '../../types'

export type AgentPose = 'idle' | 'walking' | 'inspecting' | 'action' | 'blocked' | 'verified'

interface PixelAgentProps {
  role: ActorRole | 'hunter' | 'operator' | 'sentinel' | 'analyst'
  size?: number
  pose?: AgentPose
  className?: string
  showBadge?: boolean
  label?: string
}

export const PixelAgent: React.FC<PixelAgentProps> = ({
  role,
  size = 48,
  pose = 'idle',
  className = '',
  showBadge = false,
  label,
}) => {
  // SVG Pixel grid: 16x16 crisp pixels
  const renderSprite = () => {
    switch (role) {
      case 'hunter':
        // Hunter: Coral (#D65C4B), Crimson (#8F2A1E), Peach (#FFD6A5), Eyes (#1F2923)
        return (
          <svg
            viewBox="0 0 16 16"
            width={size}
            height={size}
            style={{ imageRendering: 'pixelated' }}
            shapeRendering="crispEdges"
            className="drop-shadow-sm transition-transform duration-200"
          >
            {/* Antenna / Probe */}
            <rect x="7" y="1" width="2" height="2" fill="#D65C4B" />
            <rect x="8" y="0" width="1" height="1" fill="#FFC1B6" />
            {/* Head */}
            <rect x="5" y="3" width="6" height="4" fill="#D65C4B" />
            <rect x="4" y="4" width="8" height="3" fill="#D65C4B" />
            {/* Visor / Eyes */}
            <rect x="6" y="4" width="2" height="1" fill="#202A25" />
            <rect x="9" y="4" width="2" height="1" fill="#202A25" />
            {/* Scarf / Collar */}
            <rect x="5" y="7" width="6" height="1" fill="#8F2A1E" />
            {/* Torso */}
            <rect x="5" y="8" width="6" height="4" fill="#D65C4B" />
            {/* Belt / Notebook accessory */}
            <rect x="9" y="9" width="3" height="3" fill="#FFD6A5" />
            <rect x="10" y="10" width="1" height="1" fill="#202A25" />
            {/* Legs */}
            {pose === 'walking' ? (
              <>
                <rect x="5" y="12" width="2" height="3" fill="#8F2A1E" />
                <rect x="9" y="12" width="2" height="2" fill="#8F2A1E" />
              </>
            ) : pose === 'action' ? (
              <>
                <rect x="4" y="12" width="3" height="3" fill="#8F2A1E" />
                <rect x="9" y="12" width="3" height="3" fill="#8F2A1E" />
                {/* Probe beam */}
                <rect x="12" y="7" width="3" height="1" fill="#FFC1B6" opacity="0.8" />
              </>
            ) : (
              <>
                <rect x="5" y="12" width="2" height="3" fill="#8F2A1E" />
                <rect x="9" y="12" width="2" height="3" fill="#8F2A1E" />
              </>
            )}
          </svg>
        )

      case 'operator':
        // Operator: Vista Blue (#4E8CCB), Deep Navy (#1D436D), Soft Blue (#E5F0FC)
        return (
          <svg
            viewBox="0 0 16 16"
            width={size}
            height={size}
            style={{ imageRendering: 'pixelated' }}
            shapeRendering="crispEdges"
            className="drop-shadow-sm transition-transform duration-200"
          >
            {/* Headset / Head */}
            <rect x="5" y="2" width="6" height="1" fill="#1D436D" />
            <rect x="4" y="3" width="8" height="4" fill="#4E8CCB" />
            {/* Eyes */}
            <rect x="6" y="4" width="1" height="1" fill="#1D436D" />
            <rect x="9" y="4" width="1" height="1" fill="#1D436D" />
            {/* Collar */}
            <rect x="6" y="7" width="4" height="1" fill="#E5F0FC" />
            {/* Torso */}
            <rect x="4" y="8" width="8" height="4" fill="#4E8CCB" />
            {/* Tablet / Datapad in hand */}
            <rect x="8" y="9" width="4" height="3" fill="#78A2D2" />
            <rect x="9" y="10" width="2" height="1" fill="#E5F0FC" />
            {/* Legs */}
            {pose === 'walking' ? (
              <>
                <rect x="5" y="12" width="2" height="2" fill="#1D436D" />
                <rect x="9" y="12" width="2" height="3" fill="#1D436D" />
              </>
            ) : (
              <>
                <rect x="5" y="12" width="2" height="3" fill="#1D436D" />
                <rect x="9" y="12" width="2" height="3" fill="#1D436D" />
              </>
            )}
          </svg>
        )

      case 'sentinel':
        // Sentinel: Sage Green (#438A68), Forest (#1E4D36), Shield Mint (#BDEBD6)
        return (
          <svg
            viewBox="0 0 16 16"
            width={size}
            height={size}
            style={{ imageRendering: 'pixelated' }}
            shapeRendering="crispEdges"
            className="drop-shadow-sm transition-transform duration-200"
          >
            {/* Helmet Crest */}
            <rect x="7" y="1" width="2" height="2" fill="#BDEBD6" />
            {/* Head */}
            <rect x="5" y="3" width="6" height="4" fill="#438A68" />
            <rect x="4" y="4" width="8" height="3" fill="#438A68" />
            {/* Slit Visor */}
            <rect x="6" y="4" width="4" height="1" fill="#1E4D36" />
            {/* Torso / Armor */}
            <rect x="4" y="7" width="8" height="5" fill="#438A68" />
            <rect x="6" y="8" width="4" height="3" fill="#76A889" />
            {/* Policy Shield */}
            {pose === 'blocked' || pose === 'action' ? (
              <>
                <rect x="1" y="6" width="5" height="7" fill="#BDEBD6" />
                <rect x="2" y="7" width="3" height="5" fill="#438A68" />
                <rect x="3" y="8" width="1" height="3" fill="#FFFFFF" />
              </>
            ) : (
              <>
                <rect x="10" y="7" width="4" height="5" fill="#BDEBD6" />
                <rect x="11" y="8" width="2" height="3" fill="#438A68" />
              </>
            )}
            {/* Boots */}
            <rect x="5" y="12" width="2" height="3" fill="#1E4D36" />
            <rect x="9" y="12" width="2" height="3" fill="#1E4D36" />
          </svg>
        )

      case 'analyst':
      default:
        // Analyst: Lilac (#9270C1), Violet (#5C3884), Magnifier (#FFD6A5 / #B99BDD)
        return (
          <svg
            viewBox="0 0 16 16"
            width={size}
            height={size}
            style={{ imageRendering: 'pixelated' }}
            shapeRendering="crispEdges"
            className="drop-shadow-sm transition-transform duration-200"
          >
            {/* Beret / Hat */}
            <rect x="4" y="1" width="7" height="2" fill="#5C3884" />
            <rect x="11" y="2" width="1" height="1" fill="#B99BDD" />
            {/* Face */}
            <rect x="5" y="3" width="6" height="4" fill="#9270C1" />
            {/* Glasses / Magnifying Eye */}
            <rect x="5" y="4" width="3" height="2" fill="#F0E8FA" />
            <rect x="6" y="4" width="1" height="1" fill="#202A25" />
            <rect x="9" y="4" width="2" height="1" fill="#202A25" />
            {/* Coat */}
            <rect x="4" y="7" width="8" height="5" fill="#9270C1" />
            <rect x="6" y="7" width="4" height="5" fill="#B99BDD" />
            {/* Magnifier / Evidence Folder */}
            <rect x="1" y="7" width="3" height="3" fill="#FFD6A5" />
            <rect x="2" y="8" width="1" height="1" fill="#202A25" />
            <rect x="2" y="10" width="1" height="2" fill="#5C3884" />
            {/* Shoes */}
            <rect x="5" y="12" width="2" height="3" fill="#5C3884" />
            <rect x="9" y="12" width="2" height="3" fill="#5C3884" />
          </svg>
        )
    }
  }

  const roleLabels: Record<string, { title: string; color: string; bg: string }> = {
    hunter: { title: 'Hunter · Red Team', color: '#D65C4B', bg: '#FCE8E2' },
    operator: { title: 'Operator · Target', color: '#4E8CCB', bg: '#E5F0FC' },
    sentinel: { title: 'Sentinel · Defense', color: '#438A68', bg: '#E3F3E8' },
    analyst: { title: 'Analyst · Evidence', color: '#9270C1', bg: '#F0E8FA' },
    system: { title: 'System · Sandbox', color: '#66736A', bg: '#EEF5E9' },
  }

  const info = roleLabels[role] || roleLabels.system

  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <div className="relative flex items-center justify-center p-1 rounded-lg transition-transform hover:scale-105">
        {renderSprite()}
      </div>
      {showBadge && (
        <span
          className="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border shadow-2xs"
          style={{
            color: info.color,
            backgroundColor: info.bg,
            borderColor: `${info.color}33`,
          }}
        >
          {label || info.title}
        </span>
      )}
    </div>
  )
}
