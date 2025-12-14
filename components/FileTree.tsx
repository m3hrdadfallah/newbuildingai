import React, { useState } from 'react';
import { FileNode } from '../types';
import { IconFolder, IconFile, IconChevronRight, IconChevronDown } from './Icon';

interface FileTreeProps {
  node: FileNode;
  onSelect: (node: FileNode) => void;
  selectedId?: string;
  level?: number;
}

const FileTree: React.FC<FileTreeProps> = ({ node, onSelect, selectedId, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    } else {
      onSelect(node);
    }
  };

  const isSelected = node.id === selectedId;

  return (
    <div className="select-none">
      <div 
        onClick={handleToggle}
        className={`flex items-center py-1 px-2 cursor-pointer hover:bg-slate-700 transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <span className="mr-1 text-slate-500">
          {node.type === 'folder' ? (
             isOpen ? <IconChevronDown className="w-3 h-3" /> : <IconChevronRight className="w-3 h-3" />
          ) : <span className="w-3 h-3 block"></span>}
        </span>
        
        {node.type === 'folder' ? (
          <IconFolder className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-yellow-500'}`} />
        ) : (
          <IconFile className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-blue-400'}`} />
        )}
        
        <span className="text-sm truncate">{node.name}</span>
      </div>

      {isOpen && node.children && (
        <div>
          {node.children
            .sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'folder' ? -1 : 1;
            })
            .map((child) => (
            <FileTree 
              key={child.id} 
              node={child} 
              onSelect={onSelect} 
              selectedId={selectedId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileTree;
