'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activatePromptVersion,
  createPromptVersion,
  deletePromptVersion,
  fetchPromptManagement,
  updatePromptVersion,
} from '@/lib/api';
import {
  PromptCreatePayload,
  PromptFamily,
  PromptGroup,
  PromptUpdatePayload,
  PromptVersion,
  StoryMode,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, CheckCircle2, Layers3 } from 'lucide-react';

type EditorMode = 'create' | 'edit';
type VersionFilter = 'all' | 'active' | 'inactive';
type PromptStatus = 'active' | 'inactive';

interface PromptEditorState {
  mode: EditorMode;
  group: PromptGroup;
  key: string;
  version: string;
  description: string;
  status: PromptStatus;
  allowedCategories: string;
  requiredPlaceholders: string;
  system: string;
  userTemplate: string;
  active: boolean;
}

const GROUP_LABELS: Record<PromptGroup, string> = {
  text_prompts: 'Text Prompts',
  image_prompts: 'Image Prompts',
};

const GROUP_EXAMPLES: Record<
  PromptGroup,
  { system: string; user: string; placeholders: string }
> = {
  text_prompts: {
    system:
      'You are like a senior news editor. Write clear, factual story text and avoid dramatic or confusing wording.',
    user:
      'Language: {language}\nFocus Keywords: {keywords}\nSignal Analysis:\n{analysis}',
    placeholders: 'language, analysis, keywords',
  },
  image_prompts: {
    system:
      'You are like a visual designer helping the AI understand what picture to create.',
    user:
      'Slide Content: {slide_content}\nMode: {mode}\n{category_context}',
    placeholders: 'slide_content, mode, category_context',
  },
};

function toCsv(values: string[]) {
  return values.join(', ');
}

function fromCsv(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildCreateState(group: PromptGroup, family?: PromptFamily): PromptEditorState {
  return {
    mode: 'create',
    group,
    key: family?.key || '',
    version: '',
    description: '',
    status: 'active',
    allowedCategories: '',
    requiredPlaceholders: '',
    system: '',
    userTemplate: '',
    active: true,
  };
}

function buildEditState(version: PromptVersion): PromptEditorState {
  return {
    mode: 'edit',
    group: version.group,
    key: version.key,
    version: version.version,
    description: version.description || '',
    status: version.status === 'inactive' ? 'inactive' : 'active',
    allowedCategories: toCsv(version.allowed_categories),
    requiredPlaceholders: toCsv(version.required_placeholders),
    system: version.system,
    userTemplate: version.user_template,
    active: version.is_active,
  };
}

function fallbackPromptKeys(mode: StoryMode, group: PromptGroup): string[] {
  if (group === 'text_prompts') {
    return [mode === 'news' ? 'news' : 'curious'];
  }

  return ['alt_text_generation', 'english_fallback'];
}

function isInactiveStatus(version: PromptVersion) {
  return (version.status || '').toLowerCase() === 'inactive';
}

function isEffectivelyActive(version: PromptVersion) {
  return version.is_active && !isInactiveStatus(version);
}

export function PromptManagement({ mode }: { mode: StoryMode }) {
  const queryClient = useQueryClient();
  const [activeGroup, setActiveGroup] = useState<PromptGroup>('text_prompts');
  const [versionFilter, setVersionFilter] = useState<VersionFilter>('all');
  const [showGuide, setShowGuide] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editor, setEditor] = useState<PromptEditorState>(buildCreateState('text_prompts'));

  const promptsQuery = useQuery({
    queryKey: ['prompt-management', mode],
    queryFn: () => fetchPromptManagement(mode),
  });

  const getPromptKeysForGroup = (group: PromptGroup) => {
    const fetchedKeys = (
      group === 'text_prompts'
        ? promptsQuery.data?.text_prompts.map((family) => family.key)
        : promptsQuery.data?.image_prompts.map((family) => family.key)
    ) || fallbackPromptKeys(mode, group);

    return Array.from(new Set(fetchedKeys));
  };

  const availablePromptKeys = (
    getPromptKeysForGroup(editor.group)
  );

  const promptKeyOptions = availablePromptKeys;

  useEffect(() => {
    if (!editorOpen || editor.mode !== 'create') {
      return;
    }

    const nextKeys = getPromptKeysForGroup(editor.group);
    const nextKey = nextKeys.includes(editor.key) ? editor.key : nextKeys[0] || '';

    if (nextKey !== editor.key) {
      setEditor((current) => ({ ...current, key: nextKey }));
    }
  }, [editorOpen, editor.mode, editor.group, editor.key, mode, promptsQuery.data]);

  const invalidatePrompts = async () => {
    await queryClient.invalidateQueries({ queryKey: ['prompt-management', mode] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: PromptCreatePayload) => createPromptVersion(mode, payload),
    onSuccess: async () => {
      await invalidatePrompts();
      toast.success('Prompt version created');
      setEditorOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      group,
      key,
      version,
      payload,
    }: {
      group: PromptGroup;
      key: string;
      version: string;
      payload: PromptUpdatePayload;
    }) => updatePromptVersion(mode, group, key, version, payload),
    onSuccess: async () => {
      await invalidatePrompts();
      toast.success('Prompt version updated');
      setEditorOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const activateMutation = useMutation({
    mutationFn: ({ group, key, version }: { group: PromptGroup; key: string; version: string }) =>
      activatePromptVersion(mode, group, key, version),
    onSuccess: async () => {
      await invalidatePrompts();
      toast.success('Prompt version activated');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ group, key, version }: { group: PromptGroup; key: string; version: string }) =>
      deletePromptVersion(mode, group, key, version),
    onSuccess: async () => {
      await invalidatePrompts();
      toast.success('Prompt version deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const openCreateDialog = (group: PromptGroup, family?: PromptFamily) => {
    const nextKeys = getPromptKeysForGroup(group);
    setEditor({
      ...buildCreateState(group, family),
      key: family?.key || nextKeys[0] || '',
    });
    setEditorOpen(true);
  };

  const openEditDialog = (version: PromptVersion) => {
    setEditor(buildEditState(version));
    setEditorOpen(true);
  };

  const submitEditor = () => {
    if (!editor.key.trim() || !editor.version.trim() || !editor.system.trim() || !editor.userTemplate.trim()) {
      toast.error('Key, version, system prompt, and user prompt are required');
      return;
    }

    if (editor.mode === 'create') {
      const payload: PromptCreatePayload = {
        group: editor.group,
        key: editor.key.trim(),
        version: editor.version.trim(),
        description: editor.description.trim() || undefined,
        status: editor.status.trim() || undefined,
        allowed_categories: fromCsv(editor.allowedCategories),
        required_placeholders: fromCsv(editor.requiredPlaceholders),
        system: editor.system.trim(),
        user_template: editor.userTemplate.trim(),
        active: editor.active,
      };
      createMutation.mutate(payload);
      return;
    }

    const payload: PromptUpdatePayload = {
      description: editor.description.trim() || undefined,
      status: editor.status.trim() || undefined,
      allowed_categories: fromCsv(editor.allowedCategories),
      required_placeholders: fromCsv(editor.requiredPlaceholders),
      system: editor.system.trim(),
      user_template: editor.userTemplate.trim(),
      active: editor.active,
    };
    updateMutation.mutate({
      group: editor.group,
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
            <CardTitle className="text-zinc-100">Prompt Management</CardTitle>
            <CardDescription className="text-zinc-400">
              Manage {mode === 'news' ? 'news' : 'curious'} text and image prompt versions without editing files manually.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowGuide((current) => !current)}
            >
              {showGuide ? 'Hide Guide' : 'Show Guide'}
            </Button>
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
            <Button
              type="button"
              onClick={() => openCreateDialog(activeGroup)}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Prompt Version
            </Button>
          </div>
        </CardHeader>
      </Card>

      {showGuide && (
        <Card className="border-zinc-800 bg-zinc-900/40 text-zinc-100">
          <CardHeader>
            <CardTitle className="text-lg">Field Guide</CardTitle>
            <CardDescription className="text-zinc-400">
              Simple meaning of each field. Examples change based on the selected prompt group.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4">
              <p className="text-sm font-semibold text-zinc-100">System Prompt</p>
              <p className="mt-2 text-sm text-zinc-400">
                Think of this as instructions for the AI employee. It tells the model what role it should play and what rules it should follow.
              </p>
              <div className="mt-3 rounded-lg bg-zinc-900 p-3 text-xs whitespace-pre-wrap text-zinc-300">
                {GROUP_EXAMPLES[activeGroup].system}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4">
              <p className="text-sm font-semibold text-zinc-100">User Prompt Template</p>
              <p className="mt-2 text-sm text-zinc-400">
                This is the message shape sent to the AI every time. The app fills in the blank variables before sending it.
              </p>
              <div className="mt-3 rounded-lg bg-zinc-900 p-3 text-xs whitespace-pre-wrap text-zinc-300">
                {GROUP_EXAMPLES[activeGroup].user}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4">
              <p className="text-sm font-semibold text-zinc-100">Required Placeholders</p>
              <p className="mt-2 text-sm text-zinc-400">
                These are the blank variable names the app must replace with real values. If one is missing, the prompt can break.
              </p>
              <div className="mt-3 rounded-lg bg-zinc-900 p-3 text-xs whitespace-pre-wrap text-zinc-300">
                {GROUP_EXAMPLES[activeGroup].placeholders}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeGroup} onValueChange={(value) => setActiveGroup(value as PromptGroup)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
          <TabsTrigger value="text_prompts" className="data-[state=active]:bg-cyan-600">
            Text Prompts
          </TabsTrigger>
          <TabsTrigger value="image_prompts" className="data-[state=active]:bg-cyan-600">
            Image Prompts
          </TabsTrigger>
        </TabsList>

        {(['text_prompts', 'image_prompts'] as PromptGroup[]).map((group) => (
          <TabsContent key={group} value={group} className="mt-6">
            {(() => {
              const families = (promptsQuery.data?.[group] || [])
                .map((family) => ({
                  ...family,
                  versions: family.versions.filter((version) => {
                    if (versionFilter === 'active') {
                      return isEffectivelyActive(version);
                    }
                    if (versionFilter === 'inactive') {
                      return !isEffectivelyActive(version);
                    }
                    return true;
                  }),
                }))
                .filter((family) => family.versions.length > 0);

              if (promptsQuery.isLoading) {
                return (
                  <Card className="border-zinc-800 bg-zinc-900/50 text-zinc-100">
                    <CardContent className="p-6 text-sm text-zinc-400">Loading prompt versions...</CardContent>
                  </Card>
                );
              }

              if (promptsQuery.error) {
                return (
                  <Alert className="border-red-900 bg-red-950/40 text-red-100">
                    <AlertDescription>{(promptsQuery.error as Error).message}</AlertDescription>
                  </Alert>
                );
              }

              if (families.length === 0) {
                return (
                  <Card className="border-dashed border-zinc-800 bg-zinc-950/40 text-zinc-100">
                    <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                      <Layers3 className="h-8 w-8 text-zinc-500" />
                      <div>
                        <p className="font-medium">No {GROUP_LABELS[group].toLowerCase()} yet</p>
                        <p className="text-sm text-zinc-500">
                          Create the first version for this prompt group.
                        </p>
                      </div>
                      <Button type="button" variant="outline" onClick={() => openCreateDialog(group)}>
                        Add First Prompt
                      </Button>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <div className="space-y-4">
                  {families.map((family) => (
                    <Card key={`${group}-${family.key}`} className="border-zinc-800 bg-zinc-900/50 text-zinc-100">
                      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <CardTitle className="text-lg">{family.key}</CardTitle>
                          <CardDescription className="text-zinc-400">
                            {GROUP_LABELS[group]} grouped by prompt key
                          </CardDescription>
                        </div>
                        <Button type="button" variant="outline" onClick={() => openCreateDialog(group, family)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Version
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {family.versions.map((version) => (
                          <div
                            key={`${version.key}-${version.version}`}
                            className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4"
                          >
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-semibold text-zinc-100">
                                    {version.version}
                                  </span>
                                  {isEffectivelyActive(version) && (
                                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                                      Active
                                    </Badge>
                                  )}
                                  {version.status && (
                                    <Badge
                                      variant="outline"
                                      className={
                                        isInactiveStatus(version)
                                          ? 'border-amber-800 text-amber-300'
                                          : 'border-zinc-700 text-zinc-300'
                                      }
                                    >
                                      {version.status}
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                                    {version.file_name}
                                  </Badge>
                                </div>
                                {version.description && (
                                  <p className="text-sm text-zinc-400">{version.description}</p>
                                )}
                                {version.required_placeholders.length > 0 && (
                                  <p className="text-xs text-zinc-500">
                                    Placeholders: {version.required_placeholders.join(', ')}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {!version.is_active && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() =>
                                      activateMutation.mutate({
                                        group: version.group,
                                        key: version.key,
                                        version: version.version,
                                      })
                                    }
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Set Active
                                  </Button>
                                )}
                                <Button type="button" size="sm" variant="outline" onClick={() => openEditDialog(version)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="border-red-900 text-red-300 hover:bg-red-950 hover:text-red-200"
                                  onClick={() =>
                                    deleteMutation.mutate({
                                      group: version.group,
                                      key: version.key,
                                      version: version.version,
                                    })
                                  }
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
              );
            })()}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-zinc-800 bg-zinc-950 text-zinc-100">
          <DialogHeader>
            <DialogTitle>
              {editor.mode === 'create' ? 'Create Prompt Version' : 'Edit Prompt Version'}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Manage prompt content, placeholders, and active version selection for {GROUP_LABELS[editor.group]}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prompt-group">Prompt Group</Label>
              <Select
                value={editor.group}
                onValueChange={(value) => {
                  const nextGroup = value as PromptGroup;
                  const nextKeys = getPromptKeysForGroup(nextGroup);
                  setEditor((current) => ({
                    ...current,
                    group: nextGroup,
                    key: nextKeys.includes(current.key) ? current.key : nextKeys[0] || '',
                  }));
                }}
                disabled={editor.mode === 'edit'}
              >
                <SelectTrigger id="prompt-group" className="border-zinc-700 bg-zinc-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text_prompts">Text Prompts</SelectItem>
                  <SelectItem value="image_prompts">Image Prompts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt-key">Prompt Key</Label>
              <Select
                value={editor.key}
                onValueChange={(value) =>
                  setEditor((current) => ({ ...current, key: value }))
                }
                disabled={editor.mode === 'edit'}
              >
                <SelectTrigger id="prompt-key" className="border-zinc-700 bg-zinc-900 text-zinc-100">
                  <SelectValue placeholder="Select prompt key" />
                </SelectTrigger>
                <SelectContent>
                  {promptKeyOptions.map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-500">
                {editor.group === 'text_prompts'
                  ? mode === 'news'
                    ? 'Text prompt key for the News service.'
                    : 'Text prompt key for the Curious service.'
                  : 'Image prompt keys used by the selected service.'}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt-version">Version</Label>
              <Input
                id="prompt-version"
                value={editor.version}
                disabled={editor.mode === 'edit'}
                onChange={(event) => setEditor((current) => ({ ...current, version: event.target.value }))}
                className="border-zinc-700 bg-zinc-900 text-zinc-100"
                placeholder="v2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt-status">Status</Label>
              <p className="text-xs text-zinc-500">
                Choose whether this version should be treated as active or inactive.
              </p>
              <Select
                value={editor.status}
                onValueChange={(value) =>
                  setEditor((current) => ({ ...current, status: value as PromptStatus }))
                }
              >
                <SelectTrigger id="prompt-status" className="border-zinc-700 bg-zinc-900 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">active</SelectItem>
                  <SelectItem value="inactive">inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="prompt-description">Description</Label>
              <Input
                id="prompt-description"
                value={editor.description}
                onChange={(event) => setEditor((current) => ({ ...current, description: event.target.value }))}
                className="border-zinc-700 bg-zinc-900 text-zinc-100"
                placeholder="Short explanation of what this prompt version does"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt-allowed-categories">Allowed Categories</Label>
              <Input
                id="prompt-allowed-categories"
                value={editor.allowedCategories}
                onChange={(event) =>
                  setEditor((current) => ({ ...current, allowedCategories: event.target.value }))
                }
                className="border-zinc-700 bg-zinc-900 text-zinc-100"
                placeholder="News, Sports"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt-required-placeholders">Required Placeholders</Label>
              <p className="text-xs text-zinc-500">
                These are the variable names used inside the template. Example: {GROUP_EXAMPLES[editor.group].placeholders}
              </p>
              <Input
                id="prompt-required-placeholders"
                value={editor.requiredPlaceholders}
                onChange={(event) =>
                  setEditor((current) => ({ ...current, requiredPlaceholders: event.target.value }))
                }
                className="border-zinc-700 bg-zinc-900 text-zinc-100"
                placeholder="language, analysis, keywords"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="prompt-system">System Prompt</Label>
              <p className="text-xs text-zinc-500">
                Think of this as the job briefing for the AI. Example: {GROUP_EXAMPLES[editor.group].system}
              </p>
              <Textarea
                id="prompt-system"
                value={editor.system}
                onChange={(event) => setEditor((current) => ({ ...current, system: event.target.value }))}
                className="min-h-[180px] border-zinc-700 bg-zinc-900 text-zinc-100"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="prompt-user">User Prompt Template</Label>
              <p className="text-xs text-zinc-500">
                This is the message format the app sends every time after replacing variables with real values.
              </p>
              <div className="rounded-lg bg-zinc-900 p-3 text-xs whitespace-pre-wrap text-zinc-300">
                {GROUP_EXAMPLES[editor.group].user}
              </div>
              <Textarea
                id="prompt-user"
                value={editor.userTemplate}
                onChange={(event) => setEditor((current) => ({ ...current, userTemplate: event.target.value }))}
                className="min-h-[220px] border-zinc-700 bg-zinc-900 text-zinc-100"
              />
            </div>
            <label className="flex items-center gap-3 text-sm text-zinc-300 md:col-span-2">
              <input
                type="checkbox"
                checked={editor.active}
                onChange={(event) => setEditor((current) => ({ ...current, active: event.target.checked }))}
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-900"
              />
              Make this version active after saving
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitEditor}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {editor.mode === 'create' ? 'Create Version' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
