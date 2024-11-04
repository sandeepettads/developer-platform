import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';
import { FileNode } from '../types/file';
import { useFileStore } from '../store/useFileStore';
import { ContextMenu } from './ContextMenu';

interface FileTreeItemProps {
  node: FileNode;
  level: number;
  path: string;
  contextFiles: { path: string; content: string }[];
  onAddToAnalysis: (file: FileNode) => void;
  onRemoveFromAnalysis: (file: FileNode) => void;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({
  node,
  level,
  path,
  contextFiles,
  onAddToAnalysis,
  onRemoveFromAnalysis,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { openFile, activeFile } = useFileStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileNode } | null>(null);
  
  const isInAnalysis = contextFiles.some(file => file.path === node.path);
  const isActive = activeFile?.path === node.path;

  const handleClick = () => {
    if (node.type === 'directory') {
      setIsOpen(!isOpen);
    } else {
      openFile(node);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      file: node,
    });
  };

  const itemPath = `${path}/${node.name}`;

  return (
    <div>
      <div
        className={`flex items-center px-2 py-1 hover:bg-[#2C313A] cursor-pointer group ${
          isActive ? 'bg-[#2C313A]' : ''
        } ${isInAnalysis ? 'text-blue-400' : 'text-gray-300'}`}
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <span className="mr-1.5 opacity-70">
          {node.type === 'directory' ? (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <File size={14} />
          )}
        </span>
        <span className="text-sm truncate">{node.name}</span>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          file={contextMenu.file}
          isInAnalysis={isInAnalysis}
          onAddToAnalysis={onAddToAnalysis}
          onRemoveFromAnalysis={onRemoveFromAnalysis}
          onClose={() => setContextMenu(null)}
        />
      )}

      {isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              path={itemPath}
              contextFiles={contextFiles}
              onAddToAnalysis={onAddToAnalysis}
              onRemoveFromAnalysis={onRemoveFromAnalysis}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileTree: React.FC<{
  contextFiles: { path: string; content: string }[];
  onAddToAnalysis: (file: FileNode) => void;
  onRemoveFromAnalysis: (file: FileNode) => void;
}> = ({ contextFiles, onAddToAnalysis, onRemoveFromAnalysis }) => {
  const { files } = useFileStore();

  return (
    <div className="h-full overflow-y-auto bg-[#21252B] text-gray-300">
      {files.map((file) => (
        <FileTreeItem
          key={file.id}
          node={file}
          level={0}
          path=""
          contextFiles={contextFiles}
          onAddToAnalysis={onAddToAnalysis}
          onRemoveFromAnalysis={onRemoveFromAnalysis}
        />
      ))}
    </div>
  );
};