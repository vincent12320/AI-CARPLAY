import { useState } from "react";
import {
  Car, DoorOpen, Lightbulb, Armchair, BatteryFull, Disc3, ScanLine,
  Mic, Eye, Volume2, X, ChevronRight, Battery, Bell, Bluetooth, Wifi,
  Video, User, Package, PackageOpen, PlugZap, AppWindow, Blinds,
  CarFront, Command, SlidersHorizontal,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useUI } from "@/stores/uiStore";
import { useVehicle } from "@/stores/vehicleStore";
import { toast } from "sonner";

type Tab = { id: string; label: string; icon: React.ComponentType<{ className?: string }> };

const TABS: Tab[] = [
  { id: "common", label: "常用", icon: Car },
  { id: "window", label: "门窗", icon: DoorOpen },
  { id: "light", label: "灯光", icon: Lightbulb },
  { id: "seat", label: "座椅", icon: Armchair },
  { id: "battery", label: "电池", icon: BatteryFull },
  { id: "drive", label: "驾驶", icon: Disc3 },
  { id: "adas", label: "辅助驾驶", icon: ScanLine },
  { id: "voice", label: "语音助手", icon: Mic },
  { id: "display", label: "显示", icon: Eye },
  { id: "sound", label: "声音", icon: Volume2 },
];

export function VehicleSettings() {
  const open = useUI((s) => s.vehicleSettingsOpen);
  const close = useUI((s) => s.closeVehicleSettings);
  const tab = useUI((s) => s.vehicleTab);
  const setTab = useUI((s) => s.setVehicleTab);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm app-overlay-fade" onClick={close} />
      <div className="glass-strong relative z-10 flex h-[94%] w-[97%] max-w-[1220px] overflow-hidden rounded-[28px] shadow-2xl ring-1 ring-black/5 app-pop">
        {/* Left status / car panel */}
        <aside className="relative hidden w-[260px] shrink-0 flex-col bg-gradient-to-b from-sky-200/70 to-sky-100/40 p-5 md:flex">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-slate-400">N</span>
            <span className="text-slate-700">D</span>
            <span className="text-success">READY</span>
            <span className="ml-auto flex items-center gap-1 text-slate-600">
              1000KM <Battery className="h-4 w-4" />
            </span>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="relative grid place-items-center">
              <div className="absolute h-44 w-44 rounded-full bg-white/40 blur-2xl" />
              <Car className="relative h-28 w-28 text-slate-600 drop-shadow" strokeWidth={1.2} />
            </div>
          </div>
          <p className="text-center text-xs text-slate-500">车辆已就绪 · iSPACE</p>
        </aside>

        {/* Sidebar nav */}
        <nav className="w-[150px] shrink-0 overflow-y-auto border-r border-black/5 bg-white/40 py-4">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`mx-2 mb-1 flex w-[calc(100%-16px)] items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active ? "bg-white font-semibold text-foreground shadow-sm" : "text-muted-foreground hover:bg-white/60"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-brand" : ""}`} />
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <section className="flex flex-1 flex-col overflow-hidden">
          {/* top status row */}
          <div className="flex items-center justify-end gap-3 px-6 pt-4 text-muted-foreground">
            <span className="flex items-center gap-1 text-sm font-medium text-foreground"><User className="h-4 w-4" />车主昵称</span>
            <Video className="h-4 w-4" />
            <Bell className="h-4 w-4" />
            <Bluetooth className="h-4 w-4" />
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-semibold text-foreground">36℃</span>
            <span className="text-sm font-semibold text-success">AQI 48</span>
            <span className="text-sm font-semibold text-foreground">23:59</span>
            <button onClick={close} className="grid h-8 w-8 place-items-center rounded-full hover:bg-foreground/10">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-3">
            <TabContent tab={tab} />
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- shared UI bits ---------- */

function GroupTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 mt-1 text-sm font-semibold text-muted-foreground">{children}</h3>;
}

function ToggleRow({ title, desc, def = false }: { title: string; desc?: string; def?: boolean }) {
  const [on, setOn] = useState(def);
  return (
    <div className="flex items-start gap-3 py-3">
      <Switch checked={on} onCheckedChange={setOn} className="mt-0.5 data-[state=checked]:bg-success" />
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {desc && <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>}
      </div>
    </div>
  );
}

function Segmented({ label, options, def = 0 }: { label: string; options: string[]; def?: number }) {
  const [idx, setIdx] = useState(def);
  return (
    <div className="mb-5">
      <p className="mb-2 text-sm font-semibold text-foreground">{label}</p>
      <div className="inline-flex rounded-xl bg-black/5 p-1">
        {options.map((o, i) => (
          <button
            key={o}
            onClick={() => setIdx(i)}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
              i === idx ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function ControlCard({ title, status, statusColor = "text-muted-foreground", icon: Icon = Car, iconColor = "text-brand" }: { title: string; status: string; statusColor?: string; icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>; iconColor?: string }) {
  return (
    <button
      onClick={() => toast.success(`${title}`)}
      className="flex items-center justify-between rounded-2xl bg-white/80 p-4 text-left shadow-sm ring-1 ring-black/5 transition hover:bg-white"
    >
      <div>
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className={`mt-1 text-xs ${statusColor}`}>{status}</p>
      </div>
      <div className="grid h-12 w-16 place-items-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
        <Icon className={`h-6 w-6 ${iconColor}`} strokeWidth={1.6} />
      </div>
    </button>
  );
}

function ListRow({ title, tag, desc }: { title: string; tag?: string; desc: string }) {
  return (
    <button
      onClick={() => toast.success(title)}
      className="flex w-full items-center justify-between border-b border-black/5 py-4 text-left last:border-0"
    >
      <div>
        <p className="flex items-center gap-2 text-sm font-bold text-foreground">
          {title}
          {tag && <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">{tag}</span>}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-white/70 p-5 shadow-sm ring-1 ring-black/5">{children}</div>;
}

/* ---------- tab content ---------- */

function TabContent({ tab }: { tab: string }) {
  switch (tab) {
    case "common":
      return <CommonTab />;
    case "window":
      return <WindowTab />;
    case "light":
      return <LightTab />;
    case "voice":
      return <VoiceTab />;
    case "sound":
      return <SoundTab />;
    case "seat":
      return <Placeholder title="座椅" segs={[["座椅加热", ["关闭", "低", "中", "高"]], ["座椅通风", ["关闭", "低", "中", "高"]]]} />;
    case "battery":
      return <BatteryTab />;
    case "drive":
      return <Placeholder title="驾驶" segs={[["驾驶模式", ["舒适", "运动", "经济"]], ["转向手感", ["轻盈", "标准", "沉稳"]]]} />;
    case "adas":
      return <ADASTab />;
    case "display":
      return <Placeholder title="显示" segs={[["主题模式", ["浅色", "深色", "自动"]], ["屏幕亮度", ["低", "中", "高"]]]} />;
    default:
      return null;
  }
}

function CommonTab() {
  const personal: { label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: "后视镜调节", icon: CarFront },
    { label: "方向盘调节", icon: Disc3 },
    { label: "方向盘快捷键", icon: Command },
  ];
  return (
    <div className="space-y-6">
      <div>
        <GroupTitle>控制</GroupTitle>
        <div className="grid grid-cols-2 gap-3">
          <ControlCard title="后备箱" status="关闭" icon={Package} iconColor="text-slate-500" />
          <ControlCard title="充电口" status="故障" statusColor="text-destructive" icon={PlugZap} iconColor="text-destructive" />
          <ControlCard title="后备箱" status="已开启" statusColor="text-success" icon={PackageOpen} iconColor="text-success" />
          <ControlCard title="充电口" status="异常" statusColor="text-amber-500" icon={PlugZap} iconColor="text-amber-500" />
          <ControlCard title="车窗调节" status="点击调节" icon={AppWindow} iconColor="text-brand" />
          <ControlCard title="遮阳帘调节" status="点击调节" icon={Blinds} iconColor="text-brand" />
        </div>
      </div>
      <div>
        <GroupTitle>个人设置</GroupTitle>
        <div className="grid grid-cols-3 gap-3">
          {personal.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => toast.success(label)}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white/70 py-5 shadow-sm ring-1 ring-black/5 transition hover:bg-white"
            >
              <Icon className="h-5 w-5 text-brand" />
              <span className="text-sm font-medium text-foreground">{label}</span>
            </button>
          ))}
        </div>
        <div className="mt-3">
          <ControlCard title="个性化配置" status="我是副标题，支持自定义车辆偏好设置" icon={SlidersHorizontal} iconColor="text-brand" />
        </div>
      </div>
    </div>
  );
}

function WindowTab() {
  return (
    <div className="space-y-4">
      <GroupTitle>门锁</GroupTitle>
      <Card>
        <ToggleRow
          title="靠近自动解锁"
          desc="所有车门关闭且主副驾无人时，携钥匙（手机和 NFC 卡片钥匙除外）靠近自动解锁"
          def
        />
        <ToggleRow
          title="离开自动闭锁"
          desc="所有车门关闭且主副驾无人时，携钥匙（手机和 NFC 卡片钥匙除外）远离自动闭锁"
        />
        <ListRow title="乘客门快捷键" desc="设置乘客门一键开启快捷方式" />
      </Card>
    </div>
  );
}

function LightTab() {
  const [sub, setSub] = useState(0);
  return (
    <div>
      <div className="mb-5 flex gap-6 border-b border-black/5">
        {["灯光", "氛围灯"].map((s, i) => (
          <button
            key={s}
            onClick={() => setSub(i)}
            className={`relative pb-2 text-sm font-semibold transition ${
              i === sub ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {s}
            {i === sub && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-success" />}
          </button>
        ))}
      </div>
      {sub === 0 ? (
        <Card>
          <p className="mb-4 text-sm font-semibold text-muted-foreground">车灯设置</p>
          <Segmented label="大灯高度" options={["自动", "最高", "较高", "较低", "最低"]} />
          <Segmented label="大灯控制" options={["OFF", "近光", "远光", "AUTO"]} def={3} />
          <Segmented label="阅读灯" options={["OFF", "低", "中", "高"]} />
          <ToggleRow title="打开后雾灯" def />
        </Card>
      ) : (
        <Card>
          <Segmented label="氛围灯主题" options={["关闭", "呼吸", "律动", "常亮"]} def={1} />
          <Segmented label="亮度" options={["低", "中", "高"]} def={1} />
        </Card>
      )}
    </div>
  );
}

function VoiceTab() {
  return (
    <div className="space-y-5">
      <div>
        <GroupTitle>语音服务</GroupTitle>
        <Card>
          <ToggleRow title="使用语音服务" desc="关闭后将无法使用 baby 语音服务" def />
        </Card>
      </div>
      <div>
        <GroupTitle>全场景语音</GroupTitle>
        <Card>
          <ToggleRow title="全场景语音2.0" desc="支持多人对话、全时对话、极限对话等功能" def />
          <div className="my-2 h-px bg-black/5" />
          <p className="mb-1 text-sm font-semibold text-foreground">在线倾听时间</p>
          <p className="mb-3 text-xs text-muted-foreground">唤醒 baby 后，将保持以下倾听时间</p>
          <Segmented label="" options={["20秒", "30秒", "60秒", "120秒"]} />
          <ToggleRow title="多人对话" desc="启用后 baby 能耳听四路，同时服务多位用户" def />
          <ToggleRow title="全时对话" desc="支持多人对话、全时对话、极速对话等功能" def />
          <ToggleRow title="主驾全时可见即可说" desc="主驾看向中控屏时，屏幕中内容可见即可直接说" def />
          <ToggleRow title="极速对话" desc="启用后 baby 更快响应语音指令" def />
        </Card>
      </div>
      <div>
        <GroupTitle>其他</GroupTitle>
        <Card>
          <ToggleRow title="“你好baby”唤醒词" desc="同时支持唤醒词和指令连着说，如：你好baby打开空调" def />
          <ToggleRow title="用户体验改进计划" desc="收集语音使用信息，以提供更加准确的语音服务体验" def />
          <ListRow title="智能语音用户保护声明" desc="了解 baby 如何保护你的语音数据" />
        </Card>
      </div>
    </div>
  );
}

function SoundTab() {
  return (
    <div className="space-y-5">
      <div>
        <GroupTitle>驾驶音效</GroupTitle>
        <Card>
          <ListRow title="媒体音效" tag="动感" desc="音乐、电台、视频等媒体声音的播放效果" />
          <ListRow title="主驾音响" tag="共享模式" desc="车内声音从主驾靠背音响播放的模式设置" />
          <ListRow title="提示音主题" tag="默认" desc="部分系统、仪表提示音的声音特色" />
        </Card>
      </div>
      <div>
        <GroupTitle>车外声音效果</GroupTitle>
        <Card>
          <Segmented label="" options={["不启用", "时空扭曲", "太空幽浮", "传统引擎"]} />
        </Card>
      </div>
    </div>
  );
}

function BatteryTab() {
  const { battery, range, charging } = useVehicle();
  return (
    <div className="space-y-5">
      <GroupTitle>电池状态</GroupTitle>
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-foreground">{battery}%</p>
            <p className="mt-1 text-xs text-muted-foreground">{charging ? "充电中" : "未充电"} · 剩余续航 {range} km</p>
          </div>
          <BatteryFull className="h-12 w-12 text-success" strokeWidth={1.2} />
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-black/5">
          <div className="h-full rounded-full bg-success" style={{ width: `${battery}%` }} />
        </div>
      </Card>
      <Card>
        <Segmented label="充电限制" options={["80%", "90%", "100%"]} />
        <ToggleRow title="定时充电" desc="在低谷电价时段自动充电，更经济环保" def />
      </Card>
    </div>
  );
}

function ADASTab() {
  return (
    <div className="space-y-4">
      <GroupTitle>辅助驾驶</GroupTitle>
      <Card>
        <ToggleRow title="自适应巡航 (ACC)" desc="自动保持与前车的安全距离" def />
        <ToggleRow title="车道保持 (LKA)" desc="检测车道线并辅助保持车道居中" def />
        <ToggleRow title="自动紧急制动 (AEB)" desc="检测到碰撞风险时自动制动" def />
        <ToggleRow title="盲区监测 (BSD)" desc="监测后方盲区车辆并预警" />
      </Card>
    </div>
  );
}

function Placeholder({ title, segs }: { title: string; segs: [string, string[]][] }) {
  return (
    <div className="space-y-4">
      <GroupTitle>{title}设置</GroupTitle>
      <Card>
        {segs.map(([label, opts]) => (
          <Segmented key={label} label={label} options={opts} />
        ))}
      </Card>
    </div>
  );
}
