import React, { useState } from 'react';
import { User, FileAttachment, Post } from '../types';
import { createCreatorPost, createDataUrl } from '../storage';
import { X, Sparkles, Star, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface CreatorPostModalProps {
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
  language?: 'de' | 'en';
}

export const CreatorPostModal: React.FC<CreatorPostModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onPostCreated,
  onToast,
  language = 'de',
}) => {
  const isDe = language === 'de';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('Creator, Opinion');
  const [rating, setRating] = useState<number>(5);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [fileInputName, setFileInputName] = useState('');
  const [fileInputContent, setFileInputContent] = useState('');

  if (!isOpen) return null;

  const handleAddAttachment = () => {
    if (!fileInputName.trim()) return;
    const newAtt: FileAttachment = {
      id: `att_${Date.now()}`,
      name: fileInputName.trim(),
      size: fileInputContent.length || 1024,
      type: 'text/plain',
      contentUrl: createDataUrl(fileInputContent || 'Creator attachment content', 'text/plain'),
      downloadCount: 0,
    };
    setAttachments([...attachments, newAtt]);
    setFileInputName('');
    setFileInputContent('');
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!title.trim() || !content.trim()) {
      onToast(isDe ? 'Bitte Titel und Inhalt eingeben.' : 'Please enter title and content.', 'error');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const newPost = createCreatorPost(title, content, attachments, tags, rating, currentUser);
    onPostCreated(newPost);
    onToast(
      isDe
        ? 'Creator-Beitrag erfolgreich im Creator-Tab veröffentlicht!'
        : 'Creator post published successfully in the Creator Tab!',
      'success'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {isDe ? 'Neuen Beitrag im Creator-Tab verfassen' : 'Write Creator Tab Post'}
              </h3>
              <p className="text-xs text-slate-400">
                {isDe ? 'Teile deine Meinung als Creator. Wird direkt im Creator-Tab veröffentlicht.' : 'Share your opinion as a creator. Published directly in the Creator Tab.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isDe ? 'Beitragstitel' : 'Post Title'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isDe ? 'z.B. Meine Perspektive zu...' : 'e.g. My perspective on...'}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isDe ? 'Inhalt & Meinung' : 'Content & Opinion'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isDe ? 'Schreibe hier deine ausführliche Meinung...' : 'Write your detailed opinion here...'}
              required
              rows={5}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isDe ? 'Tags (kommagetrennt)' : 'Tags (comma separated)'}
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{isDe ? 'Beitrags-Rating (1-5 Sterne)' : 'Post Rating (1-5 Stars)'}</span>
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-auto text-xs font-bold text-amber-400">{rating} / 5</span>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isDe ? 'Anhänge hinzufügen (optional)' : 'Add Attachments (optional)'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={fileInputName}
                onChange={(e) => setFileInputName(e.target.value)}
                placeholder={isDe ? 'Dateiname (z.B. notes.txt)' : 'Filename (e.g. notes.txt)'}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={fileInputContent}
                  onChange={(e) => setFileInputContent(e.target.value)}
                  placeholder={isDe ? 'Inhalt / Text' : 'Content / Text'}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddAttachment}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shrink-0"
                >
                  {isDe ? 'Hinzufügen' : 'Add'}
                </button>
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded-lg text-xs">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      {att.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      {isDe ? 'Entfernen' : 'Remove'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>



          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
            >
              {isDe ? 'Abbrechen' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isDe ? 'Beitrag einreichen' : 'Submit Post'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
