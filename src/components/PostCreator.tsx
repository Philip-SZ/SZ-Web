import React, { useState } from 'react';
import { FileAttachment, Post, User } from '../types';
import { createPost, createDataUrl } from '../storage';
import { X, Plus, Upload, FileText, Code, ShieldCheck, Tag, Trash2, CheckCircle2 } from 'lucide-react';

interface PostCreatorProps {
  currentUser?: User | null;
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
  language?: 'de' | 'en';
}

export const PostCreator: React.FC<PostCreatorProps> = ({ currentUser, isOpen, onClose, onPostCreated, onToast, language = 'de' }) => {
  const isDe = language === 'de';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);

  // Snippet Creator helper state
  const [snippetName, setSnippetName] = useState('');
  const [snippetBody, setSnippetBody] = useState('');
  const [showSnippetForm, setShowSnippetForm] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const newAtt: FileAttachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          contentUrl: result,
          downloadCount: 0,
        };
        setAttachments((prev) => [...prev, newAtt]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleAddSnippet = () => {
    if (!snippetName.trim() || !snippetBody.trim()) {
      onToast(
        isDe
          ? 'Bitte sowohl Dateiname als auch Inhalt für das Snippet eingeben.'
          : 'Please enter both filename and body content for the snippet.',
        'error'
      );
      return;
    }

    const mime = snippetName.endsWith('.json')
      ? 'application/json'
      : snippetName.endsWith('.ts') || snippetName.endsWith('.js')
      ? 'text/typescript'
      : 'text/plain';

    const dataUrl = createDataUrl(snippetBody, mime);
    const newAtt: FileAttachment = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: snippetName.trim(),
      size: snippetBody.length,
      type: mime,
      contentUrl: dataUrl,
      downloadCount: 0,
    };

    setAttachments((prev) => [...prev, newAtt]);
    setSnippetName('');
    setSnippetBody('');
    setShowSnippetForm(false);
    onToast(
      isDe ? `Dateianhang "${newAtt.name}" hinzugefügt` : `Added file attachment "${newAtt.name}"`,
      'success'
    );
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      onToast(
        isDe
          ? 'Bitte sowohl Titel als auch Nachrichteninhalt eingeben.'
          : 'Please enter both post title and message content.',
        'error'
      );
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const post = createPost(title, content, attachments, tags, currentUser);
    onPostCreated(post);
    onToast(
      isDe ? `Beitrag von "${post.authorName}" veröffentlicht!` : `Post published by "${post.authorName}"!`,
      'success'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {isDe ? 'Neuen Entwickler-Beitrag erstellen' : 'Create New Developer Post'}
              </h2>
              <p className="text-xs text-slate-400">
                {isDe
                  ? 'Direkt von Phillip Dev für freigeschaltete Mitglieder veröffentlicht'
                  : 'Published directly by Phillip Dev for approved members'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isDe ? 'Beitragstitel' : 'Post Title'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isDe ? 'z. B. Architektur-Update v2.5 & Download-Build' : 'e.g. Architecture Update v2.5 & Downloadable Build'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isDe ? 'Tags (kommagetrennt)' : 'Tags (comma separated)'}
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder={isDe ? 'z. B. Quellcode, Dokumentation, Express' : 'e.g. Source Code, Documentation, Express'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isDe ? 'Nachrichteninhalt' : 'Message Content'}
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isDe ? 'Ankündigung oder Anweisungen für freigeschaltete Mitglieder schreiben...' : 'Write update announcement or instructions for released members...'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Attachments Section */}
          <div className="border-t border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                {isDe ? `Dateianhänge (${attachments.length})` : `File Attachments (${attachments.length})`}
              </label>
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isDe ? 'Lokale Datei hochladen' : 'Upload Local File'}</span>
                  <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                </label>

                <button
                  type="button"
                  onClick={() => setShowSnippetForm(!showSnippetForm)}
                  className="px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800/60 text-indigo-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Code className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isDe ? 'Text/Code-Snippet erstellen' : 'Create Text/Code Snippet'}</span>
                </button>
              </div>
            </div>

            {/* Quick Text/Code Snippet Form */}
            {showSnippetForm && (
              <div className="p-3 bg-slate-950 rounded-xl border border-indigo-500/30 mb-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300">
                    {isDe ? 'Neuer Text / Code Anhang' : 'New Text / Code Attachment'}
                  </span>
                  <button type="button" onClick={() => setShowSnippetForm(false)} className="text-slate-500 hover:text-slate-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={snippetName}
                  onChange={(e) => setSnippetName(e.target.value)}
                  placeholder={isDe ? 'Dateiname (z. B. setup.ts oder hinweise.txt)' : 'Filename (e.g. server_setup.ts or release_notes.txt)'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
                <textarea
                  rows={3}
                  value={snippetBody}
                  onChange={(e) => setSnippetBody(e.target.value)}
                  placeholder={isDe ? 'Dateiinhalt oder Code-Text hier einfügen...' : 'Paste file body or code text here...'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200"
                />
                <button
                  type="button"
                  onClick={handleAddSnippet}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs"
                >
                  {isDe ? 'Snippet an Beitrag anhängen' : 'Attach Snippet to Post'}
                </button>
              </div>
            )}

            {/* Attached files list */}
            {attachments.length > 0 && (
              <div className="space-y-2 mt-2">
                {attachments.map((att) => (
                  <div key={att.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="font-medium text-slate-200 truncate">{att.name}</span>
                      <span className="text-slate-500">({att.size} bytes)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-950/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
            >
              {isDe ? 'Abbrechen' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/30"
            >
              {isDe ? 'Beitrag veröffentlichen' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
