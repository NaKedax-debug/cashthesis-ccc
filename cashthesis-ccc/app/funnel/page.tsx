'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Link2, Plus, Trash2, Edit3, ChevronRight, Save, ExternalLink,
  GitBranch, Target, Mail, ShoppingCart, FileText, Megaphone, Gift,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { AffiliateLink, AffiliateNiche, Funnel, FunnelStep, FunnelStepType } from '@/types';

const NICHE_COLORS: Record<AffiliateNiche, string> = {
  crypto: 'bg-yellow-500/20 text-yellow-400',
  hosting: 'bg-blue-500/20 text-blue-400',
  vpn: 'bg-purple-500/20 text-purple-400',
  education: 'bg-green-500/20 text-green-400',
  products: 'bg-orange-500/20 text-orange-400',
  ai_tools: 'bg-cyan-500/20 text-cyan-400',
  aggregator: 'bg-pink-500/20 text-pink-400',
};

const STEP_ICONS: Record<FunnelStepType, typeof FileText> = {
  content: FileText,
  cta: Megaphone,
  landing: Target,
  affiliate: Link2,
  lead_magnet: Gift,
  email_list: Mail,
  upsell: ShoppingCart,
};

const STEP_COLORS: Record<FunnelStepType, string> = {
  content: 'border-blue-500/50 bg-blue-500/10',
  cta: 'border-green-500/50 bg-green-500/10',
  landing: 'border-purple-500/50 bg-purple-500/10',
  affiliate: 'border-yellow-500/50 bg-yellow-500/10',
  lead_magnet: 'border-cyan-500/50 bg-cyan-500/10',
  email_list: 'border-pink-500/50 bg-pink-500/10',
  upsell: 'border-orange-500/50 bg-orange-500/10',
};

// ── Affiliate Links Panel ──────────────────────────────────────
function AffiliatePanel() {
  const [affiliates, setAffiliates] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Partial<AffiliateLink>>({ niche: 'ai_tools' });
  const [editId, setEditId] = useState<string | null>(null);

  const fetchAffiliates = useCallback(async () => {
    try {
      const res = await fetch('/api/affiliates');
      const data = await res.json();
      setAffiliates(data.affiliates ?? []);
    } catch (e) {
      console.error('Failed to load affiliates', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAffiliates(); }, [fetchAffiliates]);

  const handleSave = async () => {
    if (!form.name || !form.niche) return;
    const method = editId ? 'PATCH' : 'POST';
    const body = editId ? { ...form, id: editId } : form;
    await fetch('/api/affiliates', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setForm({ niche: 'ai_tools' });
    setEditId(null);
    setShowAdd(false);
    fetchAffiliates();
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/affiliates', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchAffiliates();
  };

  const startEdit = (a: AffiliateLink) => {
    setForm(a);
    setEditId(a.id);
    setShowAdd(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Affiliate Links</h2>
        <Dialog open={showAdd} onOpenChange={(open) => { setShowAdd(open); if (!open) { setForm({ niche: 'ai_tools' }); setEditId(null); } }}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#00e68a] text-black hover:bg-[#00e68a]/80">
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent className="border-white/10 bg-[#12121a] text-white">
            <DialogHeader>
              <DialogTitle>{editId ? 'Edit' : 'Add'} Affiliate Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Name (e.g. Bybit)" value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border-white/10 bg-white/5 text-white" />
              <Select value={form.niche ?? 'ai_tools'} onValueChange={(v) => setForm({ ...form, niche: v as AffiliateNiche })}>
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#12121a] text-white">
                  {Object.keys(NICHE_COLORS).map((n) => (
                    <SelectItem key={n} value={n}>{n.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Commission (e.g. 30% rev share)" value={form.commission ?? ''} onChange={(e) => setForm({ ...form, commission: e.target.value })}
                className="border-white/10 bg-white/5 text-white" />
              <Input placeholder="Signup URL" value={form.signup_url ?? ''} onChange={(e) => setForm({ ...form, signup_url: e.target.value })}
                className="border-white/10 bg-white/5 text-white" />
              <Input placeholder="Tracking URL" value={form.tracking_url ?? ''} onChange={(e) => setForm({ ...form, tracking_url: e.target.value })}
                className="border-white/10 bg-white/5 text-white" />
              <Textarea placeholder="Notes (optional)" value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="border-white/10 bg-white/5 text-white" rows={2} />
              <Button onClick={handleSave} className="w-full bg-[#00e68a] text-black hover:bg-[#00e68a]/80">
                <Save className="mr-1 h-4 w-4" /> {editId ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-sm text-white/30">Loading...</p>
      ) : affiliates.length === 0 ? (
        <Card className="border-white/5 bg-white/[0.02]">
          <CardContent className="py-8 text-center">
            <Link2 className="mx-auto mb-2 h-8 w-8 text-white/10" />
            <p className="text-sm text-white/30">No affiliate links yet. Click Add to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {affiliates.map((a) => (
            <Card key={a.id} className="border-white/5 bg-white/[0.02]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{a.name}</span>
                      <Badge className={NICHE_COLORS[a.niche]}>{a.niche.replace('_', ' ')}</Badge>
                    </div>
                    {a.commission && <p className="text-xs text-[#00e68a]">{a.commission}</p>}
                    {a.tracking_url && (
                      <a href={a.tracking_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-[#4d8aff] hover:underline">
                        <ExternalLink className="h-3 w-3" /> Tracking link
                      </a>
                    )}
                    {a.notes && <p className="text-xs text-white/40">{a.notes}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(a)} className="h-7 w-7 p-0 text-white/40 hover:text-white">
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)} className="h-7 w-7 p-0 text-white/40 hover:text-[#ff4d6a]">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Funnel Step Tree (Recursive) ───────────────────────────────
function StepNode({ step, depth = 0, onUpdate, onDelete, onAddChild }: {
  step: FunnelStep;
  depth?: number;
  onUpdate: (id: string, updates: Partial<FunnelStep>) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}) {
  const Icon = STEP_ICONS[step.type];
  const color = STEP_COLORS[step.type];

  return (
    <div className="relative" style={{ marginLeft: depth * 24 }}>
      {depth > 0 && (
        <div className="absolute -left-4 top-0 h-full w-px bg-white/10" />
      )}
      {depth > 0 && (
        <div className="absolute -left-4 top-5 h-px w-4 bg-white/10" />
      )}
      <div className={`mb-2 rounded-lg border p-3 ${color}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <Input
              value={step.label}
              onChange={(e) => onUpdate(step.id, { label: e.target.value })}
              className="h-7 border-none bg-transparent p-0 text-sm font-medium text-white focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center gap-1">
            <Select value={step.type} onValueChange={(v) => onUpdate(step.id, { type: v as FunnelStepType })}>
              <SelectTrigger className="h-7 w-24 border-white/10 bg-white/5 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#12121a] text-white">
                {Object.keys(STEP_ICONS).map((t) => (
                  <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={() => onAddChild(step.id)}
              className="h-7 w-7 p-0 text-white/40 hover:text-[#00e68a]">
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(step.id)}
              className="h-7 w-7 p-0 text-white/40 hover:text-[#ff4d6a]">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        {step.url && (
          <p className="mt-1 text-xs text-white/40 truncate">{step.url}</p>
        )}
      </div>
      {step.children.length > 0 && (
        <div className="relative">
          {step.children.map((child) => (
            <StepNode
              key={child.id}
              step={child}
              depth={depth + 1}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
      {step.children.length > 0 && depth === 0 && (
        <div className="ml-6 flex items-center gap-1 text-xs text-white/20">
          <ChevronRight className="h-3 w-3" />
          <span>{countDescendants(step)} steps in flow</span>
        </div>
      )}
    </div>
  );
}

function countDescendants(step: FunnelStep): number {
  let count = step.children.length;
  for (const child of step.children) {
    count += countDescendants(child);
  }
  return count;
}

// ── Funnel Editor ──────────────────────────────────────────────
function FunnelEditor({ funnel, onSave, onBack }: {
  funnel: Funnel;
  onSave: (f: Funnel) => void;
  onBack: () => void;
}) {
  const [steps, setSteps] = useState<FunnelStep[]>(funnel.steps);
  const [name, setName] = useState(funnel.name);
  const [saving, setSaving] = useState(false);

  function updateStep(id: string, updates: Partial<FunnelStep>) {
    setSteps((prev) => updateStepInTree(prev, id, updates));
  }

  function deleteStep(id: string) {
    setSteps((prev) => deleteStepFromTree(prev, id));
  }

  function addChild(parentId: string) {
    const newStep: FunnelStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'cta',
      label: 'New Step',
      children: [],
    };
    setSteps((prev) => addChildToTree(prev, parentId, newStep));
  }

  function addRootStep() {
    const newStep: FunnelStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'content',
      label: 'New Step',
      children: [],
    };
    setSteps((prev) => [...prev, newStep]);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch('/api/funnels', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: funnel.id, name, steps }),
      });
      onSave({ ...funnel, name, steps, updated_at: new Date().toISOString() });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white/60 hover:text-white">
            ← Back
          </Button>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 w-64 border-white/10 bg-white/5 text-lg font-bold text-white"
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={addRootStep} variant="outline" className="border-white/10 text-white hover:bg-white/5">
            <Plus className="mr-1 h-4 w-4" /> Add Step
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-[#00e68a] text-black hover:bg-[#00e68a]/80">
            <Save className="mr-1 h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {steps.length === 0 ? (
        <Card className="border-white/5 bg-white/[0.02]">
          <CardContent className="py-12 text-center">
            <GitBranch className="mx-auto mb-3 h-10 w-10 text-white/10" />
            <p className="text-white/30">Empty funnel. Click &quot;Add Step&quot; to begin.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
          {steps.map((step) => (
            <StepNode key={step.id} step={step} onUpdate={updateStep} onDelete={deleteStep} onAddChild={addChild} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tree helpers ────────────────────────────────────────────────
function updateStepInTree(steps: FunnelStep[], id: string, updates: Partial<FunnelStep>): FunnelStep[] {
  return steps.map((s) => {
    if (s.id === id) return { ...s, ...updates };
    if (s.children.length > 0) return { ...s, children: updateStepInTree(s.children, id, updates) };
    return s;
  });
}

function deleteStepFromTree(steps: FunnelStep[], id: string): FunnelStep[] {
  return steps.filter((s) => s.id !== id).map((s) => ({
    ...s,
    children: deleteStepFromTree(s.children, id),
  }));
}

function addChildToTree(steps: FunnelStep[], parentId: string, child: FunnelStep): FunnelStep[] {
  return steps.map((s) => {
    if (s.id === parentId) return { ...s, children: [...s.children, child] };
    if (s.children.length > 0) return { ...s, children: addChildToTree(s.children, parentId, child) };
    return s;
  });
}

// ── Funnel List Panel ──────────────────────────────────────────
function FunnelListPanel({ onSelect }: { onSelect: (f: Funnel) => void }) {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');

  const fetchFunnels = useCallback(async () => {
    try {
      const res = await fetch('/api/funnels');
      const data = await res.json();
      setFunnels(data.funnels ?? []);
    } catch (e) {
      console.error('Failed to load funnels', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFunnels(); }, [fetchFunnels]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const res = await fetch('/api/funnels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const data = await res.json();
    if (data.funnel) {
      setNewName('');
      fetchFunnels();
    }
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/funnels', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchFunnels();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="New funnel name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          className="border-white/10 bg-white/5 text-white"
        />
        <Button onClick={handleCreate} size="sm" className="bg-[#00e68a] text-black hover:bg-[#00e68a]/80">
          <Plus className="mr-1 h-4 w-4" /> Create
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-white/30">Loading...</p>
      ) : funnels.length === 0 ? (
        <Card className="border-white/5 bg-white/[0.02]">
          <CardContent className="py-8 text-center">
            <GitBranch className="mx-auto mb-2 h-8 w-8 text-white/10" />
            <p className="text-sm text-white/30">No funnels yet. Create one to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {funnels.map((f) => (
            <Card key={f.id} className="border-white/5 bg-white/[0.02] transition-colors hover:bg-white/[0.04]">
              <CardContent className="flex items-center justify-between p-4">
                <button onClick={() => onSelect(f)} className="flex-1 text-left">
                  <div className="font-semibold text-white">{f.name}</div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-white/40">
                    <span>{countAllSteps(f.steps)} steps</span>
                    <span suppressHydrationWarning>Updated {new Date(f.updated_at).toLocaleDateString()}</span>
                  </div>
                </button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(f.id)}
                  className="h-7 w-7 p-0 text-white/40 hover:text-[#ff4d6a]">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function countAllSteps(steps: FunnelStep[]): number {
  let count = steps.length;
  for (const s of steps) count += countAllSteps(s.children);
  return count;
}

// ── Main Page ──────────────────────────────────────────────────
export default function FunnelPage() {
  const [selectedFunnel, setSelectedFunnel] = useState<Funnel | null>(null);

  if (selectedFunnel) {
    return (
      <div className="space-y-6 p-6">
        <FunnelEditor
          funnel={selectedFunnel}
          onSave={(updated) => setSelectedFunnel(updated)}
          onBack={() => setSelectedFunnel(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <GitBranch className="h-6 w-6 text-[#00e68a]" />
        <h1 className="text-2xl font-bold text-white">Funnel Builder</h1>
      </div>

      <Tabs defaultValue="funnels" className="w-full">
        <TabsList className="border-white/10 bg-white/[0.03]">
          <TabsTrigger value="funnels" className="data-[state=active]:bg-[#00e68a]/20 data-[state=active]:text-[#00e68a]">
            Funnels
          </TabsTrigger>
          <TabsTrigger value="affiliates" className="data-[state=active]:bg-[#00e68a]/20 data-[state=active]:text-[#00e68a]">
            Affiliate Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="funnels" className="mt-4">
          <FunnelListPanel onSelect={setSelectedFunnel} />
        </TabsContent>

        <TabsContent value="affiliates" className="mt-4">
          <AffiliatePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
