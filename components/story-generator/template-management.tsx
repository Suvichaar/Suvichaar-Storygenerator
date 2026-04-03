'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateTemplateVersion,
  createTemplateVersion,
  deleteTemplateVersion,
  fetchTemplateManagement,
  updateTemplateVersion,
} from '@/lib/api';
import {
  StoryMode,
  TemplateCreatePayload,
  TemplateFamily,
  TemplateUpdatePayload,
  TemplateVersion,
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { CheckCircle2, Code2, Pencil, Plus, Trash2, Upload } from 'lucide-react';

type EditorMode = 'create' | 'edit';
type VersionFilter = 'all' | 'active' | 'inactive';
type TemplateLifecycle = 'live' | 'draft' | 'archived';

interface TemplateEditorState {
  mode: EditorMode;
  key: string;
  version: string;
  slideGenerator: string;
  description: string;
  htmlContent: string;
  active: boolean;
  enabled: boolean;
}

function buildCreateState(family?: TemplateFamily): TemplateEditorState {
  const seedKey = family?.key || '';
  return {
    mode: 'create',
    key: seedKey,
    version: 'Auto-generated',
    slideGenerator: seedKey || '',
    description: '',
    htmlContent: '',
    active: true,
    enabled: true,
  };
}

function buildEditState(version: TemplateVersion): TemplateEditorState {
  return {
    mode: 'edit',
    key: version.key,
    version: version.version,
    slideGenerator: version.slide_generator,
    description: version.description || '',
    htmlContent: version.html_content,
    active: version.is_active,
    enabled: version.enabled,
  };
}

async function readHtmlFile(file: File): Promise<string> {
  return file.text();
}

function getLifecycle(enabled: boolean, active: boolean): TemplateLifecycle {
  if (enabled && active) {
    return 'live';
  }
  if (enabled) {
    return 'draft';
  }
  return 'archived';
}

function applyLifecycle(lifecycle: TemplateLifecycle): Pick<TemplateEditorState, 'enabled' | 'active'> {
  if (lifecycle === 'live') {
    return { enabled: true, active: true };
  }
  if (lifecycle === 'draft') {
    return { enabled: true, active: false };
  }
  return { enabled: false, active: false };
}

export function TemplateManagement({ mode }: { mode: StoryMode }) {
  const queryClient = useQueryClient();
  const [versionFilter, setVersionFilter] = useState<VersionFilter>('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editor, setEditor] = useState<TemplateEditorState>(buildCreateState());

  const templatesQuery = useQuery({
    queryKey: ['template-management', mode],
    queryFn: () => fetchTemplateManagement(mode),
  });

  const invalidateTemplates = async () => {
    await queryClient.invalidateQueries({ queryKey: ['template-management', mode] });
    await queryClient.invalidateQueries({ queryKey: ['templates', mode] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: TemplateCreatePayload) => createTemplateVersion(mode, payload),
    onSuccess: async () => {
      await invalidateTemplates();
      toast.success('Template version created');
      setEditorOpen(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, version, payload }: { key: string; version: string; payload: TemplateUpdatePayload }) =>
      updateTemplateVersion(mode, key, version, payload),
    onSuccess: async () => {
      await invalidateTemplates();
      toast.success('Template version updated');
      setEditorOpen(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const activateMutation = useMutation({
    mutationFn: ({ key, version }: { key: string; version: string }) =>
      activateTemplateVersion(mode, key, version),
    onSuccess: async () => {
      await invalidateTemplates();
      toast.success('Template version activated');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ key, version }: { key: string; version: string }) =>
      deleteTemplateVersion(mode, key, version),
    onSuccess: async () => {
      await invalidateTemplates();
      toast.success('Template version deleted');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const families = useMemo(() => {
    return (templatesQuery.data?.templates || [])
      .map((family) => ({
        ...family,
        versions: family.versions.filter((version) => {
          if (versionFilter === 'active') {
            return version.is_active;
          }
          if (versionFilter === 'inactive') {
            return !version.is_active;
          }
          return true;
        }),
      }))
      .filter((family) => family.versions.length > 0);
  }, [templatesQuery.data, versionFilter]);

  const openCreateDialog = (family?: TemplateFamily) => {
    setEditor(buildCreateState(family));
    setEditorOpen(true);
  };

  const openEditDialog = (version: TemplateVersion) => {
    setEditor(buildEditState(version));
    setEditorOpen(true);
  };

  const handleHtmlUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const htmlContent = await readHtmlFile(file);
      setEditor((current) => ({ ...current, htmlContent }));
    } catch {
      toast.error('Failed to read template file');
    } finally {
      event.target.value = '';
    }
  };

  const submitEditor = () => {
    if (!editor.key.trim() || !editor.slideGenerator.trim() || !editor.htmlContent.trim()) {
      toast.error('Template name, slide generator, and HTML content are required');
      return;
    }

    if (editor.mode === 'create') {
      const payload: TemplateCreatePayload = {
        key: editor.key.trim(),
        slide_generator: editor.slideGenerator.trim(),
        description: editor.description.trim() || undefined,
        html_content: editor.htmlContent,
        active: editor.active,
        enabled: editor.enabled,
      };
      createMutation.mutate(payload);
      return;
    }

    const payload: TemplateUpdatePayload = {
      slide_generator: editor.slideGenerator.trim(),
      description: editor.description.trim() || undefined,
      html_content: editor.htmlContent,
      active: editor.active,
      enabled: editor.enabled,
    };
    updateMutation.mutate({
      key: editor.key.trim(),
      version: editor.version.trim(),
      payload,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-zinc-800 bg-zinc-900/50 text-zinc-100">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-zinc-100">Template Management</CardTitle>
            <CardDescription className="text-zinc-400">
              Manage active HTML template versions for {mode === 'news' ? 'news' : 'curious'} stories.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-[180px]">
              <Select value={versionFilter} onValueChange={(value) => setVersionFilter(value as VersionFilter)}>
                <SelectTrigger className="border-zinc-700 bg-zinc-900 text-zinc-100">
                  <SelectValue placeholder="Filter versions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Versions</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="button" onClick={() => openCreateDialog()} className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Template Version
            </Button>
          </div>
        </CardHeader>
      </Card>

      {templatesQuery.isLoading ? (
        <Card className="border-zinc-800 bg-zinc-900/50 text-zinc-100">
          <CardContent className="p-6 text-sm text-zinc-400">Loading template versions...</CardContent>
        </Card>
      ) : templatesQuery.error ? (
        <Alert className="border-red-900 bg-red-950/40 text-red-100">
          <AlertDescription>{(templatesQuery.error as Error).message}</AlertDescription>
        </Alert>
      ) : families.length === 0 ? (
        <Card className="border-dashed border-zinc-800 bg-zinc-950/40 text-zinc-100">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <Code2 className="h-8 w-8 text-zinc-500" />
            <div>
              <p className="font-medium">No templates listed yet</p>
              <p className="text-sm text-zinc-500">Create the first managed template version.</p>
            </div>
            <Button type="button" variant="outline" onClick={() => openCreateDialog()}>
              Add First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {families.map((family) => (
            <Card key={family.key} className="border-zinc-800 bg-zinc-900/50 text-zinc-100">
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-lg">{family.key}</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Versioned HTML templates for the `{family.key}` template family
                  </CardDescription>
                </div>
                <Button type="button" variant="outline" onClick={() => openCreateDialog(family)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Version
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {family.versions.map((version) => (
                  <div key={`${version.key}-${version.version}`} className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-zinc-100">{version.version}</span>
                          {version.is_active ? (
                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Active</Badge>
                          ) : null}
                          <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                            {version.slide_generator}
                          </Badge>
                          {!version.enabled ? (
                            <Badge variant="outline" className="border-amber-800 text-amber-300">
                              Disabled
                            </Badge>
                          ) : null}
                        </div>
                        {version.description ? <p className="text-sm text-zinc-400">{version.description}</p> : null}
                        <p className="text-xs text-zinc-500">{version.file_path}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!version.is_active ? (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => activateMutation.mutate({ key: version.key, version: version.version })}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Set Active
                          </Button>
                        ) : null}
                        <Button type="button" size="sm" variant="outline" onClick={() => openEditDialog(version)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={version.is_active}
                          onClick={() => deleteMutation.mutate({ key: version.key, version: version.version })}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-4xl border-zinc-800 bg-zinc-950 text-zinc-100">
          <DialogHeader>
            <DialogTitle>{editor.mode === 'create' ? 'Create Template Version' : 'Edit Template Version'}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Upload or paste HTML, manage versions, and control which version is active for this template key.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="template-key">Template Name</Label>
              <Input
                id="template-key"
                value={editor.key}
                onChange={(event) => setEditor((current) => ({ ...current, key: event.target.value }))}
                disabled={editor.mode === 'edit'}
                className="border-zinc-700 bg-zinc-900 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-version">Version Label</Label>
              <Input
                id="template-version"
                value={editor.version}
                disabled
                className="border-zinc-700 bg-zinc-900 text-zinc-100"
              />
              <p className="text-xs text-zinc-500">
                {editor.mode === 'create'
                  ? 'This is generated automatically when you create a new version.'
                  : 'Version labels are generated automatically and cannot be edited.'}
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="template-slide-generator">Slide Generator</Label>
              <Input
                id="template-slide-generator"
                value={editor.slideGenerator}
                onChange={(event) => setEditor((current) => ({ ...current, slideGenerator: event.target.value }))}
                className="border-zinc-700 bg-zinc-900 text-zinc-100"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="template-description">Description</Label>
              <Input
                id="template-description"
                value={editor.description}
                onChange={(event) => setEditor((current) => ({ ...current, description: event.target.value }))}
                className="border-zinc-700 bg-zinc-900 text-zinc-100"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="template-upload">Upload HTML</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="template-upload"
                  type="file"
                  accept=".html,text/html"
                  onChange={handleHtmlUpload}
                  className="border-zinc-700 bg-zinc-900 text-zinc-100 file:text-zinc-200"
                />
                <Upload className="h-4 w-4 text-zinc-500" />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="template-html-content">HTML Content</Label>
              <Textarea
                id="template-html-content"
                value={editor.htmlContent}
                onChange={(event) => setEditor((current) => ({ ...current, htmlContent: event.target.value }))}
                rows={18}
                className="border-zinc-700 bg-zinc-900 font-mono text-xs text-zinc-100"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Lifecycle</Label>
              <Select
                value={getLifecycle(editor.enabled, editor.active)}
                onValueChange={(value) =>
                  setEditor((current) => ({
                    ...current,
                    ...applyLifecycle(value as TemplateLifecycle),
                  }))
                }
              >
                <SelectTrigger className="border-zinc-700 bg-zinc-900 text-zinc-100">
                  <SelectValue placeholder="Select lifecycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-500">
                `Live` is the currently used version. `Draft` is saved but not active. `Archived` is kept only for history.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitEditor}
              className="bg-cyan-600 hover:bg-cyan-700"
              disabled={
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {editor.mode === 'create' ? 'Create Version' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
