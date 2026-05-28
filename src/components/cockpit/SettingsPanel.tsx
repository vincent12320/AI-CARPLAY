import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useVPA } from "@/stores/vpaStore";
import { useSettings, type IntentRule } from "@/stores/settingsStore";

export function SettingsPanel() {
  const open = useVPA((s) => s.panelOpen);
  const togglePanel = useVPA((s) => s.togglePanel);
  const s = useSettings();
  const [rulesText, setRulesText] = useState(() => JSON.stringify(s.intentRules, null, 2));

  function saveRules() {
    try {
      const parsed = JSON.parse(rulesText) as IntentRule[];
      if (!Array.isArray(parsed)) throw new Error("根必须是数组");
      s.setIntentRules(parsed);
      toast.success("意图规则已保存");
    } catch (e) {
      toast.error(`JSON 解析失败：${(e as Error).message}`);
    }
  }

  return (
    <Sheet open={open} onOpenChange={togglePanel}>
      <SheetContent className="w-[460px] sm:max-w-[460px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>iSPACE 设置</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="ai" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="kb">知识库</TabsTrigger>
            <TabsTrigger value="intent">意图</TabsTrigger>
            <TabsTrigger value="memory">记忆</TabsTrigger>
            <TabsTrigger value="persona">人格</TabsTrigger>
          </TabsList>

          {/* AI */}
          <TabsContent value="ai" className="space-y-3 pt-4">
            <Field label="API Base URL">
              <Input value={s.ai.baseURL} onChange={(e) => s.setAI({ baseURL: e.target.value })} placeholder="https://api.openai.com/v1" />
            </Field>
            <Field label="API Key">
              <Input type="password" value={s.ai.apiKey} onChange={(e) => s.setAI({ apiKey: e.target.value })} placeholder="sk-..." />
            </Field>
            <Field label="模型">
              <Input value={s.ai.model} onChange={(e) => s.setAI({ model: e.target.value })} placeholder="gpt-4o-mini" />
            </Field>
            <div className="flex items-center justify-between">
              <Label>流式响应</Label>
              <Switch checked={s.ai.stream} onCheckedChange={(v) => s.setAI({ stream: v })} />
            </div>
            <p className="text-xs text-muted-foreground">兼容任意 OpenAI 格式接口（OpenAI / DeepSeek / 自部署 vLLM 等）。密钥仅存于本地浏览器。</p>
          </TabsContent>

          {/* Dify */}
          <TabsContent value="kb" className="space-y-3 pt-4">
            <Field label="Dify API 地址">
              <Input value={s.dify.endpoint} onChange={(e) => s.setDify({ endpoint: e.target.value })} placeholder="https://api.dify.ai/v1" />
            </Field>
            <Field label="Dify API Key">
              <Input type="password" value={s.dify.apiKey} onChange={(e) => s.setDify({ apiKey: e.target.value })} placeholder="app-..." />
            </Field>
            <div className="flex items-center justify-between">
              <Label>启用知识库</Label>
              <Switch checked={s.dify.enabled} onCheckedChange={(v) => s.setDify({ enabled: v })} />
            </div>
          </TabsContent>

          {/* Intent */}
          <TabsContent value="intent" className="space-y-3 pt-4">
            <Label>意图规则 (JSON 数组)</Label>
            <Textarea
              value={rulesText}
              onChange={(e) => setRulesText(e.target.value)}
              className="h-72 font-mono text-xs"
            />
            <Button onClick={saveRules} className="w-full">保存规则</Button>
          </TabsContent>

          {/* Memory */}
          <TabsContent value="memory" className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <Label>启用长期记忆</Label>
              <Switch checked={s.memoryEnabled} onCheckedChange={s.setMemoryEnabled} />
            </div>
            <div className="space-y-2">
              {s.memories.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border p-2">
                  <div className="text-sm">
                    <span className="font-semibold">{m.key}</span>
                    <span className="ml-2 text-muted-foreground">{m.value}</span>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => s.removeMemory(m.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {!s.memories.length && <p className="text-xs text-muted-foreground">暂无记忆条目</p>}
            </div>
            <AddMemory />
            <Button variant="outline" className="w-full" onClick={s.clearMemories}>清空全部</Button>
          </TabsContent>

          {/* Persona */}
          <TabsContent value="persona" className="space-y-3 pt-4">
            <Field label="VPA 名称">
              <Input value={s.persona.name} onChange={(e) => s.setPersona({ name: e.target.value })} />
            </Field>
            <Field label="语气">
              <select
                value={s.persona.tone}
                onChange={(e) => s.setPersona({ tone: e.target.value as any })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="friendly">亲切自然</option>
                <option value="professional">专业克制</option>
                <option value="playful">活泼俏皮</option>
                <option value="calm">沉稳安静</option>
              </select>
            </Field>
            <Field label="语言">
              <select
                value={s.persona.language}
                onChange={(e) => s.setPersona({ language: e.target.value as any })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="zh-CN">中文</option>
                <option value="en-US">English</option>
              </select>
            </Field>
            <Field label="形象主色">
              <Input type="color" value={s.persona.avatarColor} onChange={(e) => s.setPersona({ avatarColor: e.target.value })} className="h-10 w-20 p-1" />
            </Field>
            <Field label="问候语模板">
              <Input value={s.persona.greetingTemplate} onChange={(e) => s.setPersona({ greetingTemplate: e.target.value })} />
            </Field>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function AddMemory() {
  const add = useSettings((s) => s.addMemory);
  const [k, setK] = useState("");
  const [v, setV] = useState("");
  return (
    <div className="flex gap-2">
      <Input placeholder="键，如「喜好」" value={k} onChange={(e) => setK(e.target.value)} />
      <Input placeholder="值，如「咖啡不加糖」" value={v} onChange={(e) => setV(e.target.value)} />
      <Button onClick={() => { if (k && v) { add(k, v); setK(""); setV(""); } }}>+</Button>
    </div>
  );
}
