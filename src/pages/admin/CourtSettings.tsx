import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2, Plus, Save, Image, CalendarX } from 'lucide-react';
import { courtService } from '../../services/courtService';
import { adminService } from '../../services/bookingService';
import type { Court, BlockedDate } from '../../types';
import { formatTime } from '../../utils/format';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CourtSettings() {
  const [court, setCourt] = useState<Court | null>(null);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockStart, setNewBlockStart] = useState('');
  const [newBlockEnd, setNewBlockEnd] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  const [addingBlock, setAddingBlock] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      courtService.getCourt(),
      courtService.getBlockedDates(),
    ]).then(([c, b]) => {
      setCourt(c);
      setBlockedDates(b);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!court) return;
    setSaving(true);
    try {
      const updated = await courtService.updateSettings({
        name: court.name,
        type: court.type,
        indoor: court.indoor,
        pricePerHour: court.pricePerHour,
        amenities: court.amenities,
        imageUrl: court.imageUrl,
        images: court.images,
        status: court.status,
        openTime: court.openTime,
        closeTime: court.closeTime,
        dimensions: court.dimensions,
        surface: court.surface,
      });
      setCourt(updated);
      toast.success('Court settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !court) return;
    setUploadingImage(true);
    try {
      const { url } = await adminService.uploadFile(file);
      setCourt((c) => c ? { ...c, images: [...c.images, url], imageUrl: c.imageUrl || url } : c);
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingImage(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDeleteImage = async (url: string) => {
    if (!court) return;
    try {
      await adminService.deleteFile(url);
      setCourt((c) =>
        c ? {
          ...c,
          images: c.images.filter((i) => i !== url),
          imageUrl: c.imageUrl === url ? (c.images.find((i) => i !== url) ?? '') : c.imageUrl,
        } : c
      );
      toast.success('Image removed');
    } catch {
      toast.error('Failed to remove image');
    }
  };

  const handleAddBlock = async () => {
    if (!newBlockDate) return;
    setAddingBlock(true);
    try {
      const bd = await courtService.addBlockedDate({
        date: newBlockDate,
        startTime: newBlockStart || undefined,
        endTime: newBlockEnd || undefined,
        reason: newBlockReason || undefined,
      });
      setBlockedDates((prev) => [...prev, bd]);
      setNewBlockDate(''); setNewBlockStart(''); setNewBlockEnd(''); setNewBlockReason('');
      toast.success('Blocked date added');
    } catch {
      toast.error('Failed to add blocked date');
    } finally {
      setAddingBlock(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    try {
      await courtService.deleteBlockedDate(id);
      setBlockedDates((prev) => prev.filter((b) => b.id !== id));
      toast.success('Removed');
    } catch {
      toast.error('Failed to remove');
    }
  };

  if (loading) return <LoadingSpinner className="py-20" />;
  if (!court) return <p className="text-center py-8 text-slate-400">Court not found.</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Court Details */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">Court Details</h3>
          <Button size="sm" onClick={handleSave} loading={saving} icon={<Save size={14} />}>Save</Button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Court Name"
            value={court.name}
            onChange={(e) => setCourt((c) => c ? { ...c, name: e.target.value } : c)}
          />
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Status</label>
            <select
              value={court.status}
              onChange={(e) => setCourt((c) => c ? { ...c, status: e.target.value as Court['status'] } : c)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Price per Hour (₱)</label>
            <input
              type="number"
              value={court.pricePerHour}
              onChange={(e) => setCourt((c) => c ? { ...c, pricePerHour: Number(e.target.value) } : c)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Type</label>
            <select
              value={court.type}
              onChange={(e) => setCourt((c) => c ? { ...c, type: e.target.value as Court['type'], indoor: e.target.value === 'indoor' } : c)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            >
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
            </select>
          </div>
          <Input
            label="Open Time"
            type="time"
            value={court.openTime}
            onChange={(e) => setCourt((c) => c ? { ...c, openTime: e.target.value } : c)}
          />
          <Input
            label="Close Time"
            type="time"
            value={court.closeTime}
            onChange={(e) => setCourt((c) => c ? { ...c, closeTime: e.target.value } : c)}
          />
          <Input
            label="Dimensions"
            value={court.dimensions}
            onChange={(e) => setCourt((c) => c ? { ...c, dimensions: e.target.value } : c)}
            placeholder="e.g. 44ft x 20ft"
          />
          <Input
            label="Surface"
            value={court.surface}
            onChange={(e) => setCourt((c) => c ? { ...c, surface: e.target.value } : c)}
            placeholder="e.g. Cushion, Hardcourt"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Amenities (comma-separated)</label>
          <input
            value={court.amenities.join(', ')}
            onChange={(e) => setCourt((c) => c ? { ...c, amenities: e.target.value.split(',').map(a => a.trim()).filter(Boolean) } : c)}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            placeholder="WiFi, Parking, Showers"
          />
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Image size={17} className="text-teal-600" /> Court Images
          </h3>
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <Button size="sm" variant="outline" loading={uploadingImage} onClick={() => fileRef.current?.click()} icon={<Upload size={14} />}>
              Upload
            </Button>
          </div>
        </div>

        {court.images.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No images uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {court.images.map((url, idx) => (
              <motion.div key={url} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative group rounded-xl overflow-hidden aspect-video bg-slate-100">
                <img src={url} alt={`Court ${idx + 1}`} className="w-full h-full object-cover" />
                {court.imageUrl === url && (
                  <span className="absolute top-2 left-2 bg-teal-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">Main</span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {court.imageUrl !== url && (
                    <button
                      onClick={() => setCourt((c) => c ? { ...c, imageUrl: url } : c)}
                      className="px-2 py-1 bg-teal-600 text-white text-xs rounded-lg"
                    >
                      Set Main
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteImage(url)}
                    className="p-1.5 bg-red-500 text-white rounded-lg"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Blocked Dates */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <CalendarX size={17} className="text-teal-600" /> Blocked Dates
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="date"
            value={newBlockDate}
            onChange={(e) => setNewBlockDate(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          />
          <input
            type="time"
            value={newBlockStart}
            onChange={(e) => setNewBlockStart(e.target.value)}
            placeholder="Start time (opt)"
            className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          />
          <input
            type="time"
            value={newBlockEnd}
            onChange={(e) => setNewBlockEnd(e.target.value)}
            placeholder="End time (opt)"
            className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          />
          <input
            type="text"
            value={newBlockReason}
            onChange={(e) => setNewBlockReason(e.target.value)}
            placeholder="Reason (opt)"
            className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          />
        </div>
        <Button size="sm" onClick={handleAddBlock} loading={addingBlock} disabled={!newBlockDate} icon={<Plus size={14} />}>
          Add Blocked Date
        </Button>

        {blockedDates.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No blocked dates.</p>
        ) : (
          <div className="space-y-2">
            {blockedDates.map((bd) => (
              <div key={bd.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                <div>
                  <p className="text-sm font-medium text-slate-800">{bd.date}</p>
                  <p className="text-xs text-slate-500">
                    {bd.startTime && bd.endTime ? `${formatTime(bd.startTime)} – ${formatTime(bd.endTime)}` : 'All day'}
                    {bd.reason && ` · ${bd.reason}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteBlock(bd.id)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
