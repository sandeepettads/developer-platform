import React, { useState, useMemo } from 'react';
import { MessageSquare, Code, Loader2, X } from 'lucide-react';
import { analyzeCode } from '../services/codeAnalysis';
import { Tooltip } from './Tooltip';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ContextFile {
  path: string;
  content: string;
}

export const InteractionPanel: React.FC<{
  selectedFile?: string;
  fileContent?: string;
  contextFiles: ContextFile[];
  onRemoveContext: (path: string) => void;
}> = ({ selectedFile, fileContent, contextFiles, onRemoveContext }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const uniqueContextFiles = useMemo(() => {
    if (!selectedFile) return contextFiles;
    return contextFiles.filter(file => file.path !== selectedFile);
  }, [contextFiles, selectedFile]);

  const createMessage = (type: 'user' | 'assistant', content: string, isLoading = false): Message => ({
    id: crypto.randomUUID(),
    type,
    content,
    timestamp: new Date(),
    isLoading
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || (!fileContent && uniqueContextFiles.length === 0)) return;

    const userMessage = createMessage('user', input);
    const loadingMessage = createMessage('assistant', '', true);

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput('');
    setIsAnalyzing(true);

    try {
      const context = uniqueContextFiles.map(file => 
        `File: ${file.path}\n${file.content}`
      ).join('\n\n');
      
      const fullContext = fileContent ? 
        (context ? `${context}\n\nCurrent file: ${selectedFile}\n${fileContent}` : fileContent) :
        context;

      if (!fullContext) {
        throw new Error('No files selected for analysis');
      }

      const prompt = `Analyze only the following code context and answer the question. Do not use any external knowledge or assumptions outside of the provided context:\n\n${fullContext}\n\nQuestion: ${input}`;
      
      const analysis = await analyzeCode(prompt);
      
      setMessages(prev => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.length - 1;
        newMessages[loadingIndex] = createMessage('assistant', analysis);
        return newMessages;
      });
    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.length - 1;
        newMessages[loadingIndex] = createMessage(
          'assistant',
          error instanceof Error ? error.message : 'Failed to analyze code. Please try again.'
        );
        return newMessages;
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <MessageSquare size={16} className="mr-2" />
          <span className="text-sm font-medium">Code Analysis</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0">
        {(uniqueContextFiles.length > 0 || fileContent) && (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {uniqueContextFiles.map((file) => (
                <div
                  key={`context-file-${file.path}`}
                  className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md text-sm group"
                >
                  <Tooltip content={file.path}>
                    <span className="truncate max-w-[150px]">{file.path}</span>
                  </Tooltip>
                  <button
                    onClick={() => onRemoveContext(file.path)}
                    className="opacity-60 hover:opacity-100 hover:text-red-500 transition-opacity"
                    aria-label="Remove file"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {fileContent && selectedFile && (
                <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md text-sm">
                  <Tooltip content={selectedFile}>
                    <span className="truncate max-w-[150px]">Active: {selectedFile}</span>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${msg.type === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block max-w-[80%] px-4 py-2 rounded-lg ${
                  msg.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 shadow-sm'
                }`}
              >
                {msg.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Analyzing code...</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                      {msg.content}
                    </p>
                    <span className="text-xs opacity-75 block">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={uniqueContextFiles.length > 0 || fileContent ? "Ask about the code..." : "Select files to analyze using right-click"}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                disabled={isAnalyzing || (!fileContent && uniqueContextFiles.length === 0)}
              />
              <button
                type="submit"
                className={`p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isAnalyzing ? 'cursor-not-allowed' : ''
                }`}
                disabled={isAnalyzing || !input.trim() || (!fileContent && uniqueContextFiles.length === 0)}
              >
                {isAnalyzing ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Code size={20} />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};