import React, { useState } from 'react';
import { Save, Play, Bug, Plus } from 'lucide-react';
import { useFileStore } from '../store/useFileStore';
import { FileUpload } from './FileUpload';
import { NewFileDialog } from './NewFileDialog';

export const Toolbar: React.FC = () => {
  const { activeFile, updateFile } = useFileStore();
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false);

  const handleSave = async () => {
    if (activeFile) {
      await updateFile(activeFile);
    }
  };

  return (
    <>
      <div className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 bg-white dark:bg-gray-900">
        <button
          onClick={handleSave}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md mr-2"
          title="Save"
        >
          <Save size={20} />
        </button>
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md mr-2"
          title="Run"
        >
          <Play size={20} />
        </button>
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md mr-2"
          title="Debug"
        >
          <Bug size={20} />
        </button>
        <div className="flex-1" />
        <FileUpload />
        <button
          onClick={() => setIsNewFileDialogOpen(true)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md ml-2"
          title="New File"
        >
          <Plus size={20} />
        </button>
      </div>
      <NewFileDialog
        isOpen={isNewFileDialogOpen}
        onClose={() => setIsNewFileDialogOpen(false)}
      />
    </>
  );
};