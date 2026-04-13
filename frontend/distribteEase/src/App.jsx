import { useState, useEffect, useCallback,useRef } from "react";
import axios from "axios";
import { Analytics } from "@vercel/analytics/react";

// ── API ────────────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000"
});
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem("de_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem("de_token");
    localStorage.removeItem("de_user");
    window.location.reload();
  }
  return Promise.reject(err);
});

// ── GLOBAL STYLES ──────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');

:root {
  --bg:      #080810;
  --s1:      #0f0f1a;
  --s2:      #161624;
  --s3:      #1e1e30;
  --border:  #252538;
  --accent:  #00e5a0;
  --a2:      #6c63ff;
  --a3:      #ff4d6d;
  --warn:    #f0a500;
  --text:    #eeeef8;
  --muted: #9e9eed;
  --font:    'JetBrains Mono', monospace;
  --display: 'Syne', sans-serif;
  --sidebar: 252px;
}

* { margin:0; padding:0; box-sizing:border-box; }
html { height:100%; }
body { font-family:var(--font); background:var(--bg); color:var(--text); -webkit-font-smoothing:antialiased; min-height:100vh;width: 100%;margin: 0; 
  padding: 0;  
  overflow-x: hidden; }


::-webkit-scrollbar { width:3px; height:3px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }

@keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes toastIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
@keyframes modalIn { from{opacity:0;transform:translateY(14px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes spin    { to{transform:rotate(360deg)} }
@keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }

.fade-up { animation: fadeUp 0.35s ease forwards; }
.d1{animation-delay:.04s;opacity:0} .d2{animation-delay:.09s;opacity:0}
.d3{animation-delay:.14s;opacity:0} .d4{animation-delay:.19s;opacity:0}

/* ── LAYOUT ── */
.app-shell {
  display: flex;
  min-height: 100vh;
  width: 100vw;        /* ← was 100%, change to 100vw */
  overflow-x: hidden;  /* ← add this */
}
.sidebar {
  width: var(--sidebar);
  min-width: var(--sidebar);
  background: var(--s1);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 100;
  transition: transform .28s cubic-bezier(.4,0,.2,1);
  overflow: hidden;
}
.main-wrap {
  flex: 1;
  min-width: 0;
  margin-left: var(--sidebar);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg);
  width: calc(100vw - var(--sidebar));  /* ← add this */
  overflow-x: hidden;
  background-image:
    linear-gradient(rgba(0,229,160,.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,229,160,.018) 1px, transparent 1px);
  background-size: 36px 36px;
}
.topbar {
  padding: 14px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(8,8,16,.9);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 50;
  flex-shrink: 0;
}
.page-content {
  flex: 1;
  padding: 22px 24px;
  width: 100%;
}
.overlay {
  display: none;
  position: fixed; inset: 0;
  background: rgba(0,0,0,.7);
  z-index: 98;
  backdrop-filter: blur(3px);
}
.overlay.show { display: block; }
.hbg-btn {
  display: none !important;
  background: none;
  border: 1px solid var(--border);
  border-radius: 7px;
  color: var(--text);
  padding: 6px 10px;
  cursor: pointer;
  font-size: 15px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.shop-name-link { cursor: default; }
.show-sm        { display: none; }

/* ── GRIDS ── */
.g4  { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
.g2  { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.g32 { display:grid; grid-template-columns:2fr 1fr; gap:16px; }

/* ── TABLE ── */
.tbl-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
.tbl { width:100%; border-collapse:collapse;table-layout: fixed; }
.th  { text-align:left; padding:9px 14px; font-size:9px; color:var(--muted); text-transform:uppercase; letter-spacing:2px; border-bottom:1px solid var(--border); font-weight:400; white-space:nowrap; font-family:var(--font); }
.td  { padding:11px 14px; font-size:12px; }
.tr:hover .td { background:rgba(255,255,255,.015); }

/* ── NAV ── */
.nav-item {
  display:flex; align-items:center; gap:10px;
  padding:9px 11px; border-radius:7px; cursor:pointer;
  margin-bottom:2px; font-size:12px; transition:all .18s;
  position:relative; border:1px solid transparent;
  color: var(--muted);
}
.nav-item:hover { background:rgba(255,255,255,.04); color:var(--text); }
.nav-item.active { background:rgba(0,229,160,.08); color:var(--accent); border-color:rgba(0,229,160,.2); }
.nav-pip { display:none; position:absolute; left:-10px; top:50%; transform:translateY(-50%); width:2px; height:18px; background:var(--accent); border-radius:0 2px 2px 0; }
.nav-item.active .nav-pip { display:block; }

/* ── RESPONSIVE ── */
@media(max-width:1100px) {
  .g4  { grid-template-columns:repeat(2,1fr); }
  .g32 { grid-template-columns:1fr; }
}
@media(max-width:768px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
  .main-wrap { margin-left: 0 !important; }
  .hbg-btn { display: flex !important; }
   .shop-name-link {
    cursor: pointer;
    color: var(--accent);
    text-decoration: underline dotted;
  }
  .show-sm { display: block; }
}
@media(max-width:640px) {
  .g4  { grid-template-columns:1fr 1fr; gap:10px; }
  .g2  { grid-template-columns:1fr; }
  .g32 { grid-template-columns:1fr; }
  .page-content { padding:14px; }
  .topbar { padding:12px 14px; }
  .hide-sm { display:none !important;}
}
  html, body, #root {
  height: 100%;
     /* ← add this */
}
`;

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const SC = {
  placed:     {bg:"rgba(108,99,255,.12)", color:"#8f88ff", border:"rgba(108,99,255,.3)"},
  packed:     {bg:"rgba(240,165,0,.1)",   color:"#f0a500", border:"rgba(240,165,0,.3)"},
  dispatched: {bg:"rgba(0,229,160,.1)",   color:"#00e5a0", border:"rgba(0,229,160,.3)"},
  active:     {bg:"rgba(0,229,160,.1)",   color:"#00e5a0", border:"rgba(0,229,160,.3)"},
  inactive:   {bg:"rgba(255,77,109,.1)",  color:"#ff4d6d", border:"rgba(255,77,109,.3)"},
};
const RC = {
  admin:        {bg:"rgba(255,77,109,.1)",  color:"#ff4d6d", border:"rgba(255,77,109,.3)"},
  salesman:     {bg:"rgba(108,99,255,.12)", color:"#8f88ff", border:"rgba(108,99,255,.3)"},
  packing: {bg:"rgba(240,165,0,.1)",   color:"#f0a500", border:"rgba(240,165,0,.3)"},
};
const NAV = [
  {id:"dashboard",icon:"◈",label:"Dashboard",   badge:"Live"},
  {id:"orders",   icon:"⬡",label:"Orders"},
  {id:"shops",    icon:"◉",label:"Shops"},
  {id:"products", icon:"◧",label:"Products"},
  {id:"summary",  icon:"◰",label:"Daily Summary"},
  {id:"users",    icon:"◎",label:"Users"},
];

// ── ATOMS ──────────────────────────────────────────────────────────────────
const Badge = ({label,cfg})=>(
  <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"2px 9px",borderRadius:20,fontSize:10,fontWeight:500,background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}`,whiteSpace:"nowrap"}}>
    <span style={{width:4,height:4,borderRadius:"50%",background:cfg.color,flexShrink:0,display:"inline-block"}}/>
    {label}
  </span>
);

const RoleBadge = ({role})=>{
  const c = RC[role]||RC.salesman;
  return <span style={{padding:"2px 7px",borderRadius:4,fontSize:10,textTransform:"uppercase",letterSpacing:.8,background:c.bg,color:c.color,border:`1px solid ${c.border}`}}>{role?.replace("_"," ")}</span>;
};

const Btn = ({children,primary,danger,small,full,onClick,disabled,style={}})=>{
  const [h,sH]=useState(false);
  return (
    <button disabled={disabled} onClick={onClick}
      onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)}
      style={{
        padding:small?"4px 11px":"8px 16px", borderRadius:7,
        fontFamily:"var(--font)", fontSize:small?10:12,
        cursor:disabled?"not-allowed":"pointer", opacity:disabled?.55:1,
        display:"inline-flex", alignItems:"center", gap:6,
        transition:"all .18s", border:"none", whiteSpace:"nowrap",
        width:full?"100%":"auto", justifyContent:full?"center":"flex-start",
        ...(primary?{background:h?"#00ffc4":"#00e5a0",color:"#000",fontWeight:700,
          boxShadow:h?"0 4px 18px rgba(0,229,160,.32)":"none",
          transform:h?"translateY(-1px)":"none"}:
          danger?{background:"rgba(255,77,109,.1)",color:"#ff4d6d",border:"1px solid rgba(255,77,109,.3)"}:
          {background:h?"var(--s3)":"transparent",color:h?"var(--text)":"var(--muted)",border:"1px solid var(--border)"}),
        ...style
      }}>
      {children}
    </button>
  );
};

const Field = ({label,...p})=>(
  <div style={{marginBottom:14}}>
    {label&&<div style={{fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1.8,marginBottom:5}}>{label}</div>}
    <input {...p} style={{width:"100%",background:"var(--s2)",border:"1px solid var(--border)",borderRadius:7,padding:"9px 12px",fontFamily:"var(--font)",fontSize:12,color:"var(--text)",outline:"none",...p.style}}
      onFocus={e=>e.target.style.borderColor="#00e5a0"}
      onBlur={e=>e.target.style.borderColor="var(--border)"}/>
  </div>
);

const Drop = ({label,options,...p})=>(
  <div style={{marginBottom:14}}>
    {label&&<div style={{fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1.8,marginBottom:5}}>{label}</div>}
    <select {...p} style={{width:"100%",background:"var(--s2)",border:"1px solid var(--border)",borderRadius:7,padding:"9px 12px",fontFamily:"var(--font)",fontSize:12,color:"var(--text)",outline:"none",cursor:"pointer"}}>
      {options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
    </select>
  </div>
);

const Card = ({children,style={}})=>(
  <div style={{background:"var(--s1)",border:"1px solid var(--border)",borderRadius:11,overflow:"hidden",...style}}>
    {children}
  </div>
);

const CardHead = ({title,action})=>(
  <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
    <div style={{fontFamily:"var(--display)",fontSize:13,fontWeight:700}}>{title}</div>
    {action}
  </div>
);

const Spin = ()=>(
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:40}}>
    <div style={{width:22,height:22,border:"2px solid var(--border)",borderTop:"2px solid var(--accent)",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
  </div>
);

const ErrMsg = ({msg})=>msg?(
  <div style={{background:"rgba(255,77,109,.1)",border:"1px solid rgba(255,77,109,.3)",borderRadius:7,padding:"9px 12px",fontSize:11,color:"#ff4d6d",marginBottom:14}}>{msg}</div>
):null;

const Modal = ({open,onClose,title,children,footer})=>{
  if(!open) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",backdropFilter:"blur(5px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:14}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"var(--s1)",border:"1px solid var(--border)",borderRadius:14,width:"100%",maxWidth:460,maxHeight:"92vh",overflowY:"auto",animation:"modalIn .28s ease"}}>
        <div style={{padding:"18px 22px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"var(--s1)",zIndex:1}}>
          <div style={{fontFamily:"var(--display)",fontSize:15,fontWeight:700}}>{title}</div>
          <span onClick={onClose} style={{cursor:"pointer",color:"var(--muted)",fontSize:17,lineHeight:1,padding:"2px 6px"}}
            onMouseEnter={e=>e.target.style.color="var(--text)"} onMouseLeave={e=>e.target.style.color="var(--muted)"}>✕</span>
        </div>
        <div style={{padding:22}}>{children}</div>
        {footer&&<div style={{padding:"13px 22px",borderTop:"1px solid var(--border)",display:"flex",gap:8,justifyContent:"flex-end",position:"sticky",bottom:0,background:"var(--s1)"}}>{footer}</div>}
      </div>
    </div>
  );
};

const Toast = ({toasts})=>(
  <div style={{position:"fixed",bottom:20,right:20,zIndex:9999,display:"flex",flexDirection:"column",gap:7,pointerEvents:"none"}}>
    {toasts.map(t=>(
      <div key={t.id} style={{background:"var(--s1)",border:"1px solid var(--accent)",borderRadius:9,padding:"10px 14px",display:"flex",alignItems:"center",gap:9,fontSize:12,animation:"toastIn .25s ease",boxShadow:"0 4px 24px rgba(0,229,160,.12)"}}>
        <span style={{fontSize:14}}>{t.icon}</span>{t.msg}
      </div>
    ))}
  </div>
);
const ConfirmModal = ({open, onConfirm, onCancel, title="Are you sure?", message, confirmLabel="Yes, Sign Out", danger=true})=>{
  if(!open) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      {/* backdrop */}
      <div onClick={onCancel} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)"}}/>
      {/* box */}
      <div style={{position:"relative",width:"100%",maxWidth:360,background:"var(--s1)",border:"1px solid var(--border)",borderRadius:12,padding:24,boxShadow:"0 24px 64px rgba(0,0,0,.6)"}}>
        {/* icon */}
        <div style={{width:44,height:44,borderRadius:"50%",background:danger?"rgba(255,80,80,.1)":"rgba(0,229,160,.1)",border:`1px solid ${danger?"rgba(255,80,80,.3)":"rgba(0,229,160,.3)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,marginBottom:16}}>
          {danger?"⚠️":"❓"}
        </div>
        {/* title */}
        <div style={{fontSize:15,fontWeight:700,marginBottom:6,color:"var(--text)"}}>{title}</div>
        {/* message */}
        {message&&<div style={{fontSize:12,color:"var(--muted)",marginBottom:20,lineHeight:1.6}}>{message}</div>}
        {/* buttons */}
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn onClick={onCancel}>Cancel</Btn>
          <button
            onClick={onConfirm}
            style={{
              padding:"8px 16px",borderRadius:7,border:"none",cursor:"pointer",
              fontSize:12,fontWeight:600,fontFamily:"var(--font)",
              background:danger?"#ff5050":"var(--accent)",
              color:danger?"#fff":"#000",
              transition:"opacity .15s",
            }}
            onMouseEnter={e=>e.currentTarget.style.opacity=".85"}
            onMouseLeave={e=>e.currentTarget.style.opacity="1"}
          >{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};
const useConfirm = () => {
  const [cfg, sCfg] = useState(null);

  const confirm = (title, message, confirmLabel="Confirm", danger=true) =>
    new Promise(resolve => {
      sCfg({ title, message, confirmLabel, danger, resolve });
    });

  const modal = cfg ? (
    <ConfirmModal
      open={true}
      title={cfg.title}
      message={cfg.message}
      confirmLabel={cfg.confirmLabel}
      danger={cfg.danger}
      onConfirm={() => { sCfg(null); cfg.resolve(true); }}
      onCancel={()  => { sCfg(null); cfg.resolve(false); }}
    />
  ) : null;

  return { confirm, modal };
};
// ── LOGIN ──────────────────────────────────────────────────────────────────
const Login = ({onLogin})=>{
  const [email,sE]=useState(""); const [pass,sP]=useState("");
  const [err,sErr]=useState(""); const [load,sL]=useState(false);

  const submit = async()=>{
    if(!email||!pass){ sErr("Enter email and password"); return; }
    sL(true); sErr("");
    try {
      const fd=new FormData();
      fd.append("username",email); fd.append("password",pass);
      const r=await api.post("/auth/login",fd);
      localStorage.setItem("de_token",r.data.access_token);
      localStorage.setItem("de_user",JSON.stringify({name:r.data.name,role:r.data.role}));
      onLogin();
    } catch { sErr("Invalid email or password"); }
    finally { sL(false); }
  };

  return (
    <div style={{
      position:"fixed", inset:0,               /* ← covers full viewport always */
      background:"var(--bg)",
      backgroundImage:"linear-gradient(rgba(0,229,160,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,160,.02) 1px,transparent 1px)",
      backgroundSize:"36px 36px",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:16,
      overflow:"auto",                          /* ← scroll if screen too small */
    }}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{marginBottom:32,textAlign:"center"}}>
          <div style={{fontFamily:"var(--display)",fontSize:32,fontWeight:800,letterSpacing:-1}}>
            distribute<span style={{color:"var(--accent)"}}>Ease</span>
          </div>
          <div style={{fontSize:10,color:"var(--muted)",letterSpacing:3,marginTop:6,textTransform:"uppercase"}}>Distribution Management System</div>
        </div>
        <Card style={{padding:28}}>
          <ErrMsg msg={err}/>
          <Field label="Email" type="email" placeholder="arif@admin.com" value={email} onChange={e=>sE(e.target.value)}/>
          <Field label="Password" type="password" placeholder="••••••••" value={pass} onChange={e=>sP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
          <Btn primary full disabled={load} onClick={submit} style={{marginTop:8}}>
            {load?"Signing in…":"Sign In →"}
          </Btn>
        </Card>
      </div>
    </div>
  );
};

// ── DASHBOARD ──────────────────────────────────────────────────────────────
const Dashboard = ()=>{
  const [orders,sO] = useState([]);
  const [shops,sSh] = useState([]);
  const [prods,sPr] = useState([]);
  const [load,sL]   = useState(true);
  const today       = new Date().toISOString().split("T")[0];

  useEffect(()=>{
    Promise.all([
      api.get("/orders/orders").catch(()=>({data:[]})),
      api.get("/shops/shops").catch(()=>({data:[]})),
      api.get("/products/products").catch(()=>({data:[]})),
    ]).then(([o,sh,pr])=>{
      sO(o.data||[]); sSh(sh.data||[]); sPr(pr.data||[]);
    }).finally(()=>sL(false));
  },[]);

  const todayOrders  = orders.filter(o=>o.order_date?.startsWith(today));
  const todayRev     = todayOrders.reduce((a,o)=>a+(o.Grand_total||0),0);
  const activeShops  = shops.filter(s=>s.is_active).length;
  const totalRev     = orders.reduce((a,o)=>a+(o.Grand_total||0),0);

  // Last 7 days bar chart
  const weekData = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i));
    const ds=d.toISOString().split("T")[0];
    return orders.filter(o=>o.order_date?.startsWith(ds)).length;
  });
  const weekMax = Math.max(...weekData,1);

  const stats = [
    {label:"Today's Orders",  val:load?"…":todayOrders.length,             sub:`${orders.length} total`,                  color:"var(--accent)"},
    {label:"Active Shops",    val:load?"…":activeShops,                    sub:`${shops.length} registered`,              color:"var(--a2)"},
    {label:"Revenue Today",   val:load?"…":`₹${todayRev.toLocaleString()}`,sub:`₹${totalRev.toLocaleString()} all time`,  color:"var(--warn)"},
  ];

  return (
    <div>
      <div className="g4" style={{marginBottom:20}}>
        {stats.map((s,i)=>(
          <div key={i} className={`fade-up d${i+1}`} style={{background:"var(--s1)",border:"1px solid var(--border)",borderRadius:11,padding:18,position:"relative",overflow:"hidden"}}>
            <div style={{fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>{s.label}</div>
            <div style={{fontFamily:"var(--display)",fontSize:28,fontWeight:800,color:s.color,lineHeight:1,marginBottom:6}}>{s.val}</div>
            <div style={{position:"absolute",top:0,right:0,width:44,height:44,borderRadius:"0 11px 0 44px",background:s.color,opacity:.07}}/>
          </div>
        ))}
      </div>

      <div className="g32">
        <Card>
          <CardHead title="Recent Orders" action={<span style={{fontSize:10,color:"var(--muted)"}}>{orders.length} total</span>}/>
          {load?<Spin/>:(
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr>
                  <th className="th">Shop</th>
                  <th className="th">Total</th><th className="th">Date</th>
                </tr></thead>
                <tbody>
                  {orders.slice(0,6).map(o=>(
                    <tr key={o.id} className="tr">
                      <td className="td">{o.shop_name||`Shop #${o.shop_id}`}</td>
                      <td className="td" style={{color:"var(--accent)"}}>₹{o.Grand_total}</td>
                      <td className="td" style={{color:"var(--muted)"}}>{o.order_date?.split("T")[0]||"—"}</td>
                    </tr>
                  ))}
                  {!load&&orders.length===0&&<tr><td colSpan={5} style={{padding:"28px 0",textAlign:"center",color:"var(--muted)",fontSize:12}}>No orders yet</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <CardHead title="Orders This Week"/>
            <div style={{padding:"14px 18px"}}>
              {load?<Spin/>:(
                <>
                  <div style={{display:"flex",alignItems:"flex-end",gap:5,height:60}}>
                    {weekData.map((v,i)=>(
                      <div key={i} title={`${v} orders`} style={{flex:1,height:`${Math.max((v/weekMax)*100,3)}%`,borderRadius:"3px 3px 0 0",
                        background:i===6?"linear-gradient(180deg,#00ffc4,#00e5a0)":"linear-gradient(180deg,#00e5a0,rgba(0,229,160,.2))",
                        transition:"height .5s ease",minHeight:3}}/>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:5,marginTop:5}}>
                    {["M","T","W","T","F","S","S"].map((d,i)=>(
                      <div key={i} style={{flex:1,textAlign:"center",fontSize:8,color:"var(--muted)"}}>{d}</div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card>
            <CardHead title="Quick Stats"/>
            <div style={{padding:"4px 18px"}}>
              {[
                {label:"Total Products",  val:load?"…":prods.length,                                      color:"var(--accent)"},
                {label:"Total Revenue",   val:load?"…":`₹${totalRev.toLocaleString()}`,                   color:"var(--warn)"},
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:i<2?"1px solid rgba(37,37,56,.8)":"none"}}>
                  <div style={{fontSize:11,color:"var(--muted)"}}>{s.label}</div>
                  <div style={{fontFamily:"var(--display)",fontWeight:700,fontSize:16,color:s.color}}>{s.val}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ── ORDERS ─────────────────────────────────────────────────────────────────
// ── SEARCHABLE SELECT COMPONENT ───────────────────────────────────────────
// Drop this into your App.jsx replacing the Orders component

const SearchSelect = ({ label, options, value, onChange, placeholder = "Search…", onAddNew, addNewLabel }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen]   = useState(false);
  const ref               = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  // ✅ no default selected — only show if explicitly chosen
  const selected = value ? options.find(o => String(o.value) === String(value)) : null;

  return (
    <div ref={ref} style={{ marginBottom: 14, position: "relative" }}>
      {label && (
        <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1.8, marginBottom: 5 }}>
          {label}
        </div>
      )}
      {/* Trigger */}
      <div
        onClick={() => { setOpen(o => !o); setQuery(""); }}
        style={{
          width: "100%", background: "var(--s2)", border: `1px solid ${open ? "#00e5a0" : "var(--border)"}`,
          borderRadius: 7, padding: "9px 12px", fontFamily: "var(--font)", fontSize: 12,
          color: selected ? "var(--text)" : "var(--muted)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
          transition: "border-color .15s",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {selected ? selected.label : placeholder}
        </span>
        <span style={{ color: "var(--muted)", fontSize: 10, flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "var(--s1)", border: "1px solid var(--border)", borderRadius: 8,
          zIndex: 200, boxShadow: "0 8px 32px rgba(0,0,0,.5)", overflow: "hidden",
        }}>
          {/* Search input */}
          <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)" }}>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Type to search…"
              style={{
                width: "100%", background: "var(--s2)", border: "1px solid var(--border)",
                borderRadius: 6, padding: "7px 10px", fontFamily: "var(--font)", fontSize: 11,
                color: "var(--text)", outline: "none",
              }}
              onFocus={e => e.target.style.borderColor = "#00e5a0"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>

          {/* Options */}
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {filtered.length > 0 ? filtered.map(o => (
              <div
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false); setQuery(""); }}
                style={{
                  padding: "9px 12px", fontSize: 12, cursor: "pointer",
                  background: String(o.value) === String(value) ? "rgba(0,229,160,.08)" : "transparent",
                  color: String(o.value) === String(value) ? "var(--accent)" : "var(--text)",
                  transition: "background .12s",
                  display: "flex", alignItems: "center", gap: 8,
                }}
                onMouseEnter={e => { if (String(o.value) !== String(value)) e.currentTarget.style.background = "rgba(255,255,255,.04)"; }}
                onMouseLeave={e => { if (String(o.value) !== String(value)) e.currentTarget.style.background = "transparent"; }}
              >
                {String(o.value) === String(value) && (
                  <span style={{ fontSize: 10, color: "var(--accent)", flexShrink: 0 }}>✓</span>
                )}
                <span>{o.label}</span>
              </div>
            )) : null}

            {/* ✅ Add new button when no results found */}
            {filtered.length === 0 && onAddNew && (
              <div
                onClick={() => { setOpen(false); setQuery(""); onAddNew(query); }}
                style={{
                  padding: "12px", fontSize: 12, cursor: "pointer", textAlign: "center",
                  color: "var(--accent)", borderTop: filtered.length > 0 ? "1px solid var(--border)" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(0,229,160,.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize: 14 }}>+</span>
                <span>{addNewLabel || `Add "${query}"`}</span>
              </div>
            )}

            {/* ✅ Add new button always visible at bottom when results exist too */}
            {filtered.length > 0 && onAddNew && (
              <div
                onClick={() => { setOpen(false); setQuery(""); onAddNew(query); }}
                style={{
                  padding: "10px 12px", fontSize: 11, cursor: "pointer",
                  color: "var(--accent)", borderTop: "1px solid var(--border)",
                  display: "flex", alignItems: "center", gap: 6,
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(0,229,160,.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize: 13 }}>+</span>
                <span>{addNewLabel || "Add new"}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


// ── PRODUCT ROWS WITH SEARCH ───────────────────────────────────────────────
const ProductRows = ({ rows, setRows, products, onAddProduct }) => {
  // ── calculate live total ──
  const total = rows.reduce((sum, r) => {
    const prod = products.find(p => String(p.id) === String(r.product_id));
    return sum + (prod ? prod.price * (parseInt(r.quantity) || 0) : 0);
  }, 0);

  return (
    <div>
      <div style={{fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1.8,marginBottom:7}}>
        Products
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:10}}>
        {rows.map((r,i) => {
          // ── per row amount ──
          const prod = products.find(p => String(p.id) === String(r.product_id));
          const rowAmt = prod ? prod.price * (parseInt(r.quantity) || 0) : 0;

          return (
            <div key={i} style={{display:"flex",gap:7,alignItems:"flex-end"}}>
              <div style={{flex:2,minWidth:0}}>
                <SearchSelect
                  placeholder="Search product…"
                  options={products.map(p=>({value:p.id, label:`${p.name} — ₹${p.price}`}))}
                  value={r.product_id}
                  onChange={val=>{ const n=[...rows]; n[i].product_id=val; setRows(n); }}
                  onAddNew={()=>onAddProduct&&onAddProduct(i)}
                  addNewLabel="Add new product"
                />
              </div>
              <div style={{marginBottom:14}}>
                <input
                  type="number" min={0} value={r.quantity}
                  onChange={e=>{ const n=[...rows]; n[i].quantity=e.target.value; setRows(n); }}
                  style={{width:70,background:"var(--s2)",border:"1px solid var(--border)",borderRadius:7,padding:"9px 8px",fontFamily:"var(--font)",fontSize:11,color:"var(--text)",outline:"none",flexShrink:0}}
                  onFocus={e=>e.target.style.borderColor="#00e5a0"}
                  onBlur={e=>e.target.style.borderColor="var(--border)"}
                />
              </div>
              {/* ── per row amount ── */}
              <div style={{marginBottom:14,minWidth:52,textAlign:"right"}}>
                <div style={{fontSize:11,color: rowAmt>0?"var(--accent)":"var(--muted)",fontWeight:600,padding:"9px 4px"}}>
                  {rowAmt>0?`₹${rowAmt}`:"—"}
                </div>
              </div>
              {rows.length>1&&(
                <div style={{marginBottom:14}}>
                  <span
                    onClick={()=>setRows(rows.filter((_,j)=>j!==i))}
                    style={{cursor:"pointer",color:"var(--a3)",fontSize:16,padding:"9px 4px",display:"block"}}
                  >✕</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Btn full onClick={()=>setRows([...rows,{product_id:"",quantity:1}])}>
        + Add Product
      </Btn>

      {/* ── live total ── */}
      {total>0&&(
        <div style={{
          marginTop:12,padding:"10px 14px",
          background:"rgba(0,229,160,.06)",
          border:"1px solid rgba(0,229,160,.2)",
          borderRadius:8,
          display:"flex",justifyContent:"space-between",alignItems:"center"
        }}>
          <span style={{fontSize:11,color:"var(--muted)"}}>Order Total</span>
          <span style={{fontSize:15,fontWeight:700,color:"var(--accent)"}}>₹{total}</span>
        </div>
      )}
    </div>
  );
};

// ── ORDERS PAGE ────────────────────────────────────────────────────────────
const Orders = ({ toast }) => {
  const [orders, sO]     = useState([]);   const [load, sL]      = useState(true);
  const [modal, sM]      = useState(false); const [saving, sSv]   = useState(false);
  const [editModal, sEM] = useState(false); const [editOrder, sEO]= useState(null);
  const [shopModal, sSM] = useState(false); const [shopOrders, sSOrd] = useState([]);
  const [selShop, sSS]   = useState(null);  const [shopLoad, sSL] = useState(false);
  const [shops, sSh]     = useState([]);    const [prods, sPr]    = useState([]);
  const [shopId, sSi]    = useState("");    const [rows, sR]      = useState([{ product_id: "", quantity: 1 }]);
  const [editRows, sER]  = useState([]);    const [err, sErr]     = useState("");

  const [addShopModal, sASM] = useState(false);
  const [addShopForm, sASF]  = useState({shop_name:"",phone:"",address:""});
  const [addShopSaving, sASv]= useState(false);
  const [addShopErr, sASE]   = useState("");

  const [addProdModal, sAPM] = useState(false);
  const [addProdForm, sAPF]  = useState({name:"",price:"",mrp:""});
  const [addProdSaving, sAPv]= useState(false);
  const [addProdErr, sAPE]   = useState("");

  // ✅ useRef instead of useState — no stale closure issue
  const addProdTarget   = useRef("place");
  const addProdRowIndex = useRef(0);
  const user = JSON.parse(localStorage.getItem("de_user") || "{}");
  const load_ = useCallback(() => {
    sL(true);
    api.get("/orders/orders").then(r => {
      const d = r.data || [];
      d.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
      sO(d);
    }).catch(() => sO([])).finally(() => sL(false));
  }, []);

  useEffect(() => {
    load_();
    api.get("/shops/shops").then(r => {
      const raw = r.data;
      const d = Array.isArray(raw) ? raw : raw?.shops || raw?.data || [];
      sSh(d);
    }).catch(() => sSh([]));
    api.get("/products/products").then(r => {
      const d = r.data || [];
      sPr(d);
    }).catch(() => {});
  }, []);

  const addShopAndSelect = async () => {
    sASE(""); sASv(true);
    try {
      const r = await api.post("/shops/shop", addShopForm);
      const res = await api.get("/shops/shops");
      const raw = res.data;
      const d = Array.isArray(raw) ? raw : raw?.shops || raw?.data || [];
      sSh(d);
      sSi(String(r.data.id));
      toast("🏪","Shop added!");
      sASM(false);
      sASF({shop_name:"",phone:"",address:""});
      // ✅ reopen place order modal after adding shop
      setTimeout(() => sM(true), 100);
    } catch(e){ sASE(e.response?.data?.detail||"Failed"); }
    finally{ sASv(false); }
  };

  const addProdAndSelect = async () => {
    sAPE(""); sAPv(true);
    try {
      const r = await api.post("/products/product", {
        name:  addProdForm.name,
        price: parseFloat(addProdForm.price),
        mrp:   parseFloat(addProdForm.mrp),
      });
      const res = await api.get("/products/products");
      const d = res.data || [];
      sPr(d);

      // ✅ use ref value — never stale
      if (addProdTarget.current === "edit") {
        sER(prev => {
          const n = [...prev];
          if (!n[addProdRowIndex.current]) n[addProdRowIndex.current] = { product_id: "", quantity: 1 };
          n[addProdRowIndex.current].product_id = String(r.data.id);
          return n;
        });
        setTimeout(() => sEM(true), 100);
      } else {
        sR(prev => {
          const n = [...prev];
          if (!n[addProdRowIndex.current]) n[addProdRowIndex.current] = { product_id: "", quantity: 1 };
          n[addProdRowIndex.current].product_id = String(r.data.id);
          return n;
        });
        setTimeout(() => sM(true), 100);
      }

      toast("📦","Product added!");
      sAPM(false);
      sAPF({name:"",price:"",mrp:""});
    } catch(e){ sAPE(e.response?.data?.detail||"Failed"); }
    finally{ sAPv(false); }
  };

  const openShopOrders = async (shopId, shopName) => {
    sSS({ id: shopId, name: shopName });
    sSL(true); sSM(true); sSOrd([]);
    try {
      const r = await api.get(`/orders/${shopId}/order`);
      const raw = r.data;
      const d = Array.isArray(raw) ? raw : raw?.orders || [];
      sSOrd(d);
    } catch { sSOrd([]); }
    finally { sSL(false); }
  };

  const place = async () => {
    sErr(""); sSv(true);
    try {
      await api.post(`/orders/${shopId}/order`, {
        items: rows.map(r => ({ product_id: parseInt(r.product_id), quantity: parseInt(r.quantity) }))
      });
      toast("🛒", "Order placed! 📱 Telegram sent");
      sM(false); load_();
    } catch (e) {
      sErr(e.response?.data?.detail || "Failed to place order");
    } finally { sSv(false); }
  };

  const openEdit = async (order) => {
    sErr("");
    try {
      const r = await api.get(`/orders/order/${order.id}`);
      const orderData = { ...r.data, id: r.data.id || r.data.order_id };
      sEO(orderData);
      const items = r.data.products || [];
      sER(items.map(p => ({ product_id: String(p.product_id), quantity: p.quantity })));
      sEM(true);
    } catch { toast("❌", "Failed to load order details"); }
  };

  const saveEdit = async () => {
    if (!editOrder?.id) { sErr("Order ID is missing, please close and try again"); return; }
    sErr(""); sSv(true);
    try {
      await api.patch(`/orders/order/${editOrder.id}`, {
        items: editRows.map(r => ({ product_id: parseInt(r.product_id), quantity: parseInt(r.quantity) }))
      });
      toast("✏️", "Order updated!"); sEM(false); load_();
    } catch (e) {
      sErr(e.response?.data?.detail || "Failed to update order");
    } finally { sSv(false); }
  };

  const { confirm, modal: confirmModal } = useConfirm();
  const del = async (id) => {
    const ok = await confirm("Delete Order?","This order will be permanently deleted.","Yes, Delete");
    if(!ok) return;
    try {
      await api.delete(`/orders/orders/${id}`);
      toast("🗑️", "Order deleted"); load_();
    } catch { toast("❌", "Failed to delete"); }
  };

  return (
    <div>
      {confirmModal}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <Btn primary onClick={() => { sErr(""); sSi(""); sR([{ product_id: "", quantity: 1 }]); sM(true); }}>+ Place Order</Btn>
      </div>

      <Card>
        {load ? <Spin /> : (
          <div className="tbl-wrap">
            <table className="tbl" style={{ minWidth: 500 }}>
              <thead><tr>
                <th className="th">Shop</th>
                <th className="th">By</th>
                <th className="th">Total</th>
                <th className="th hide-sm">Date</th>
                <th className="th">Actions</th>
              </tr></thead>
              <tbody>
                {orders.length > 0 ? orders.map(o => (
                  <tr key={o.id} className="tr">
                    <td className="td">
                      <span
                        onClick={() => openShopOrders(o.shop_id, o.shop_name || `Shop #${o.shop_id}`)}
                        style={{ fontWeight: 500, color: "var(--accent)", cursor: "pointer", textDecoration: "underline dotted" }}
                      >
                        {o.shop_name || `Shop #${o.shop_id}`}
                      </span>
                    </td>
                    <td className="td">
                    {user.role === "admin"
          ? <span style={{fontSize:11,color:"var(--muted)"}}>{o.salesman_name}</span>
          : <span style={{fontSize:11,color:"var(--muted)"}}>—</span>
        }
      </td>
                    <td className="td" style={{ color: "var(--accent)" }}>₹{o.Grand_total}</td>
                    <td className="td hide-sm" style={{ color: "var(--muted)" }}>{o.order_date?.split("T")[0] || "—"}</td>
                    <td className="td">
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn small onClick={() => openEdit(o)}>✏️ Edit</Btn>
                        <Btn small danger onClick={() => del(o.id)}>🗑️</Btn>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} style={{ padding: "32px 0", textAlign: "center", color: "var(--muted)", fontSize: 12 }}>No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Shop Orders Modal ── */}
      <Modal
        open={shopModal} onClose={() => sSM(false)}
        title={`Orders — ${selShop?.name || ""}`}
        footer={<Btn onClick={() => sSM(false)}>Close</Btn>}
      >
        {shopLoad ? <Spin /> : shopOrders.length > 0 ? (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {shopOrders.map(o => (
              <div key={o.id||o.order_id} style={{border:"1px solid var(--border)",borderRadius:8,overflow:"hidden"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:"var(--s2)"}}>
                  <span style={{fontSize:11,color:"var(--muted)"}}>
                    #{String(o.id||o.order_id).padStart(3,"0")} · {(o.order_date||"").split("T")[0]||"—"}
                  </span>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:13,fontWeight:600,color:"var(--accent)"}}>₹{o.Grand_total||o.grand_total}</span>
                    <Btn small onClick={()=>{ sSM(false); openEdit({id: o.id||o.order_id}); }}>✏️ Edit</Btn>
                  </div>
                </div>
                <div style={{padding:"8px 12px",display:"flex",flexDirection:"column",gap:4}}>
                  {(o.products||o.items||[]).map(p=>(
                    <div key={p.product_id} style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                      <span>{p.product_name}</span>
                      <span style={{color:"var(--muted)"}}>×{p.quantity} <span style={{color:"var(--accent)"}}>₹{p.amount}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{textAlign:"center",padding:32,color:"var(--muted)",fontSize:12}}>
            No orders found for this shop
          </div>
        )}
      </Modal>

      {/* ── Place Order Modal ── */}
      <Modal
        open={modal} onClose={() => sM(false)} title="Place New Order"
        footer={<><Btn onClick={() => sM(false)}>Cancel</Btn><Btn primary onClick={place} disabled={saving}>{saving ? "Placing…" : "Place Order"}</Btn></>}
      >
        <ErrMsg msg={err} />
        <SearchSelect
          label="Shop" placeholder="Search shop…"
          options={(Array.isArray(shops)?shops:[]).map(s=>({value:s.id,label:s.shop_name}))}
          value={shopId} onChange={val=>sSi(String(val))}
          onAddNew={()=>{ sASF({shop_name:"",phone:"",address:""}); sASE(""); sM(false); setTimeout(()=>sASM(true),100); }}
          addNewLabel="Add new shop"
        />
        <ProductRows
          rows={rows} setRows={sR} products={prods}
          onAddProduct={(rowIndex) => {
            addProdTarget.current   = "place";
            addProdRowIndex.current = rowIndex;
            sAPF({name:"", price:"", mrp:""});
            sAPE("");
            sM(false);
            setTimeout(() => sAPM(true), 100);
          }}
        />
        <div style={{ marginTop: 14, background: "rgba(108,99,255,.06)", border: "1px solid rgba(108,99,255,.2)", borderRadius: 7, padding: "10px 12px", fontSize: 11, color: "var(--muted)" }}>
          📨 Telegram notification sent automatically
        </div>
      </Modal>

      {/* ── Edit Order Modal ── */}
      <Modal
        open={editModal} onClose={() => sEM(false)}
        title={`Edit Order #${String(editOrder?.id || "").padStart(3, "0")}`}
        footer={<><Btn onClick={() => sEM(false)}>Cancel</Btn><Btn primary onClick={saveEdit} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Btn></>}
      >
        <ErrMsg msg={err} />
        {editOrder && (
          <div style={{ marginBottom: 16, padding: "10px 12px", background: "var(--s2)", borderRadius: 7, fontSize: 11, color: "var(--muted)", display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span>Shop: <span style={{ color: "var(--text)" }}>{editOrder.shop_name}</span></span>
            <span>Date: <span style={{ color: "var(--text)" }}>{editOrder.order_date?.split("T")[0]}</span></span>
            <span>Total: <span style={{ color: "var(--accent)" }}>₹{editOrder.Grand_total || editOrder.grand_total}</span></span>
          </div>
        )}
        <ProductRows
          rows={editRows} setRows={sER} products={prods}
          onAddProduct={(rowIndex) => {
            addProdTarget.current   = "edit";
            addProdRowIndex.current = rowIndex;
            sAPF({name:"", price:"", mrp:""});
            sAPE("");
            sEM(false);
            setTimeout(() => sAPM(true), 100);
          }}
        />
        <div style={{ marginTop: 10, fontSize: 10, color: "var(--muted)" }}>
          💡 Set quantity to 0 to remove a product from the order
        </div>
      </Modal>

      {/* ── Add Shop Modal ── */}
      <Modal open={addShopModal} onClose={()=>{ sASM(false); setTimeout(()=>sM(true),100); }} title="Add New Shop"
        footer={
          <><Btn onClick={()=>{ sASM(false); setTimeout(()=>sM(true),100); }}>Cancel</Btn>
          <Btn primary onClick={addShopAndSelect} disabled={addShopSaving}>{addShopSaving?"Saving…":"Add Shop"}</Btn></>
        }
      >
        <ErrMsg msg={addShopErr}/>
        <Field label="Shop Name" placeholder="e.g. Cafe Javas" value={addShopForm.shop_name} onChange={e=>sASF({...addShopForm,shop_name:e.target.value})}/>
        <Field label="Phone"     placeholder="9876543210"       value={addShopForm.phone}     onChange={e=>sASF({...addShopForm,phone:e.target.value})}/>
        <Field label="Address"   placeholder="Street, City"     value={addShopForm.address}   onChange={e=>sASF({...addShopForm,address:e.target.value})}/>
      </Modal>

      {/* ── Add Product Modal ── */}
      <Modal
        open={addProdModal}
        onClose={()=>{ sAPM(false); setTimeout(()=> addProdTarget.current==="edit"?sEM(true):sM(true), 100); }}
        title="Add New Product"
        footer={
          <><Btn onClick={()=>{ sAPM(false); setTimeout(()=> addProdTarget.current==="edit"?sEM(true):sM(true), 100); }}>Cancel</Btn>
          <Btn primary onClick={addProdAndSelect} disabled={addProdSaving}>{addProdSaving?"Saving…":"Add Product"}</Btn></>
        }
      >
        <ErrMsg msg={addProdErr}/>
        <Field label="Name"  placeholder="Product name"  value={addProdForm.name}  onChange={e=>sAPF({...addProdForm,name:e.target.value})}/>
        <Field label="Price" placeholder="0.00" type="number" value={addProdForm.price} onChange={e=>sAPF({...addProdForm,price:e.target.value})}/>
        <Field label="MRP"   placeholder="0.00" type="number" value={addProdForm.mrp}   onChange={e=>sAPF({...addProdForm,mrp:e.target.value})}/>
      </Modal>
    </div>
  );
};
// ── SHOPS ──────────────────────────────────────────────────────────────────
const Shops = ({toast})=>{
  const [shops,sS]      = useState([]); const [load,sL]       = useState(true);
  const [modal,sM]      = useState(false); const [saving,sSv]  = useState(false);
  const [editModal,sEM] = useState(false); const [editShop,sSE]= useState(null);
  const [shopModal,sSM] = useState(false); const [shopData,sSD]= useState(null);
  const [shopLoad,sSL]  = useState(false);
  const [form,sF]       = useState({shop_name:"",phone:"",address:""});
  const [editForm,sEF]  = useState({shop_name:"",phone:"",address:""});
  const [err,sErr]      = useState("");

  // ── order edit states ──
  const [orderEditModal,sOEM] = useState(false);
  const [editOrder,sEO]       = useState(null);
  const [editRows,sER]        = useState([]);
  const [prods,sPr]           = useState([]);
  const [editSaving,sES]      = useState(false);
  const [editErr,sEE]         = useState("");
  // ── quick place order states ──
const [orderModal,sOM]  = useState(false);
const [orderShop,sOS]   = useState(null);
const [orderRows,sOR]   = useState([{product_id:"",quantity:1}]);
const [orderSaving,sOSv]= useState(false);
const [orderErr,sOE]    = useState("");

const openPlaceOrder=(shop)=>{
  sOS(shop); sOR([{product_id:"",quantity:1}]); sOE(""); sOM(true);
};

const placeOrder=async()=>{
  if(!orderRows[0]?.product_id){ sOE("Select at least one product"); return; }
  sOE(""); sOSv(true);
  try{
    await api.post(`/orders/${orderShop.id}/order`,{
      items: orderRows.map(r=>({product_id:parseInt(r.product_id), quantity:parseInt(r.quantity)}))
    });
    toast("🛒","Order placed!"); sOM(false);
  } catch(e){ sOE(e.response?.data?.detail||"Failed to place order"); }
  finally{ sOSv(false); }
};
  const load_=useCallback(()=>{
    sL(true);
    api.get("/shops/shops")
      .then(r=>{ const raw=r.data; const d=Array.isArray(raw)?raw:raw?.shops||raw?.data||[]; sS(d); })
      .catch(()=>sS([]))
      .finally(()=>sL(false));
  },[]);

  useEffect(()=>{
    load_();
    api.get("/products/products").then(r=>sPr(r.data||[])).catch(()=>{});
  },[]);

  // ── open shop detail + orders ──
  const openShop=async(shop)=>{
    sSM(true); sSL(true); sSD(null);
    try{
      const r = await api.get(`/orders/${shop.id}/order`);
      sSD({ shop, orders: r.data?.orders || [] });
    } catch{
      sSD({ shop, orders: [] });
    } finally{ sSL(false); }
  };

  // ── open order edit from shop modal ──
  const openOrderEdit=async(order_id)=>{
    sEE(""); sSM(false);
    try{
      const r = await api.get(`/orders/order/${order_id}`);
      const data = {...r.data, id: r.data.id || r.data.order_id};
      sEO(data);
      sER((r.data.products||[]).map(p=>({product_id:String(p.product_id), quantity:p.quantity})));
      sOEM(true);
    } catch{ toast("❌","Failed to load order"); }
  };

  // ── save order edit ──
  const saveOrderEdit=async()=>{
    if(!editOrder?.id){ sEE("Order ID missing"); return; }
    sEE(""); sES(true);
    try{
      await api.patch(`/orders/order/${editOrder.id}`,{
        items: editRows.map(r=>({product_id:parseInt(r.product_id), quantity:parseInt(r.quantity)}))
      });
      toast("✏️","Order updated!"); sOEM(false);
    } catch(e){ sEE(e.response?.data?.detail||"Failed to update"); }
    finally{ sES(false); }
  };

  const add=async()=>{
    sErr(""); sSv(true);
    try{
      await api.post("/shops/shop",form);
      toast("🏪","Shop added!"); sM(false); sF({shop_name:"",phone:"",address:""}); load_();
    } catch(e){ sErr(e.response?.data?.detail||"Failed"); } finally{ sSv(false); }
  };

  const openEdit=(shop)=>{
    sSE(shop);
    sEF({shop_name:shop.shop_name, phone:shop.phone||"", address:shop.address||""});
    sErr(""); sEM(true);
  };

  const saveEdit=async()=>{
    if(!editShop?.id) return;
    sErr(""); sSv(true);
    try{
      await api.patch(`/shops/shops/${editShop.id}`,{
        shop_name: editForm.shop_name||undefined,
        phone:     editForm.phone||undefined,
        address:   editForm.address||undefined,
      });
      toast("✏️","Shop updated!"); sEM(false); load_();
    } catch(e){ sErr(e.response?.data?.detail||"Failed to update"); } finally{ sSv(false); }
  };

  const del=async(id)=>{
    if(!confirm("Delete this shop?")) return;
    try{ await api.delete(`/shops/shop/${id}`); toast("🗑️","Deleted"); load_(); }
    catch(e){ toast("❌",e.response?.data?.detail||"Failed"); }
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
        <Btn primary onClick={()=>{sErr("");sM(true);}}>+ Add Shop</Btn>
      </div>

      <Card>
  {load?<Spin/>:(
    <div className="tbl-wrap">
      <table className="tbl" style={{width:"100%",tableLayout:"fixed"}}>
        <colgroup>
          <col style={{width:"30%"}}/> 
          <col style={{width:"18%"}} className="hide-sm"/>
          <col style={{width:"22%"}} className="hide-sm"/>
          <col style={{width:"12%"}}/>
          <col style={{width:"18%"}}/>
        </colgroup>
        <thead><tr>
          <th className="th">Shop Name</th>
          <th className="th hide-sm">Phone</th>
          <th className="th hide-sm">Address</th>
          <th className="th">Status</th>
          <th className="th">Actions</th>
        </tr></thead>
        <tbody>
          {shops.length>0?shops.map(s=>(
            <tr key={s.id} className="tr">
              <td className="td">
                <span className="shop-name-link" onClick={()=>openShop(s)} style={{fontWeight:500}}>
                  {s.shop_name}
                </span>
                <div className="show-sm" style={{fontSize:10,color:"var(--muted)",marginTop:3,display:"flex",flexDirection:"column",gap:2}}>
                  {s.phone&&<span>📞 {s.phone}</span>}
                  {s.address&&<span>📍 {s.address}</span>}
                </div>
              </td>
              <td className="td hide-sm" style={{color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.phone||"—"}</td>
              <td className="td hide-sm" style={{color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.address||"—"}</td>
              <td className="td"><Badge label={s.is_active?"act":"inact"} cfg={s.is_active?SC.active:SC.inactive}/></td>
              <td className="td">
                <div style={{display:"flex",gap:4,flexWrap:"nowrap"}}>
                  <Btn small onClick={()=>openPlaceOrder(s)} style={{color:"var(--accent)",borderColor:"var(--accent)"}}>🛒</Btn>
                  <Btn small onClick={()=>openEdit(s)}>✏️</Btn>
                  <Btn small danger onClick={()=>del(s.id)}>🗑️</Btn>
                </div>
              </td>
            </tr>
          )):<tr><td colSpan={5} style={{padding:"32px 0",textAlign:"center",color:"var(--muted)",fontSize:12}}>No shops found</td></tr>}
        </tbody>
      </table>
    </div>
  )}
</Card>

      {/* ── Shop Detail + Orders Modal ── */}
      <Modal open={shopModal} onClose={()=>sSM(false)}
        title={shopData?.shop?.shop_name||"Shop Details"}
        footer={<Btn onClick={()=>sSM(false)}>Close</Btn>}
      >
        {shopLoad?<Spin/>:(
          <>
            {shopData?.shop&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16,padding:"12px",background:"var(--s2)",borderRadius:8}}>
                <div>
                  <div style={{fontSize:10,color:"var(--muted)",marginBottom:2}}>PHONE</div>
                  <div style={{fontSize:13,fontWeight:500}}>{shopData.shop.phone||"—"}</div>
                </div>
                <div>
                  <div style={{fontSize:10,color:"var(--muted)",marginBottom:2}}>STATUS</div>
                  <Badge label={shopData.shop.is_active?"active":"inactive"} cfg={shopData.shop.is_active?SC.active:SC.inactive}/>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <div style={{fontSize:10,color:"var(--muted)",marginBottom:2}}>ADDRESS</div>
                  <div style={{fontSize:13}}>{shopData.shop.address||"—"}</div>
                </div>
              </div>
            )}

            <div style={{fontSize:11,color:"var(--muted)",marginBottom:8,letterSpacing:1,textTransform:"uppercase"}}>
              Orders ({shopData?.orders?.length||0})
            </div>

            {shopData?.orders?.length>0?(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {shopData.orders.map(o=>(
                  <div key={o.order_id} style={{border:"1px solid var(--border)",borderRadius:8,overflow:"hidden"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:"var(--s2)"}}>
                      <span style={{fontSize:11,color:"var(--muted)"}}>
                        #{String(o.order_id).padStart(3,"0")} · {o.order_date?.split("T")[0]||"—"}
                      </span>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:13,fontWeight:600,color:"var(--accent)"}}>₹{o.grand_total}</span>
                        <Btn small onClick={()=>openOrderEdit(o.order_id)}>✏️ Edit</Btn>
                      </div>
                    </div>
                    <div style={{padding:"8px 12px",display:"flex",flexDirection:"column",gap:4}}>
                      {o.products.map(p=>(
                        <div key={p.product_id} style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                          <span>{p.product_name}</span>
                          <span style={{color:"var(--muted)"}}>×{p.quantity} <span style={{color:"var(--accent)"}}>₹{p.amount}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ):(
              <div style={{textAlign:"center",padding:"24px 0",color:"var(--muted)",fontSize:12}}>
                No orders yet for this shop
              </div>
            )}
          </>
        )}
      </Modal>

      {/* ── Edit Order Modal ── */}
      <Modal open={orderEditModal} onClose={()=>sOEM(false)}
        title={`Edit Order #${String(editOrder?.id||"").padStart(3,"0")}`}
        footer={
          <><Btn onClick={()=>sOEM(false)}>Cancel</Btn>
          <Btn primary onClick={saveOrderEdit} disabled={editSaving}>
            {editSaving?"Saving…":"Save Changes"}
          </Btn></>
        }
      >
        <ErrMsg msg={editErr}/>
        {editOrder&&(
          <div style={{marginBottom:16,padding:"10px 12px",background:"var(--s2)",borderRadius:7,fontSize:11,color:"var(--muted)",display:"flex",gap:16,flexWrap:"wrap"}}>
            <span>Shop: <span style={{color:"var(--text)"}}>{editOrder.shop_name}</span></span>
            <span>Date: <span style={{color:"var(--text)"}}>{editOrder.order_date?.split("T")[0]}</span></span>
            <span>Total: <span style={{color:"var(--accent)"}}>₹{editOrder.Grand_total||editOrder.grand_total}</span></span>
          </div>
        )}
        <ProductRows rows={editRows} setRows={sER} products={prods}/>
        <div style={{marginTop:10,fontSize:10,color:"var(--muted)"}}>
          💡 Set quantity to 0 to remove a product from the order
        </div>
      </Modal>

      {/* ── Add Shop Modal ── */}
      <Modal open={modal} onClose={()=>sM(false)} title="Add New Shop"
        footer={<><Btn onClick={()=>sM(false)}>Cancel</Btn><Btn primary onClick={add} disabled={saving}>{saving?"Saving…":"Add Shop"}</Btn></>}>
        <ErrMsg msg={err}/>
        <Field label="Shop Name" placeholder="e.g. Cafe Javas" value={form.shop_name} onChange={e=>sF({...form,shop_name:e.target.value})}/>
        <Field label="Phone"     placeholder="9876543210"       value={form.phone}     onChange={e=>sF({...form,phone:e.target.value})}/>
        <Field label="Address"   placeholder="Street, City"     value={form.address}   onChange={e=>sF({...form,address:e.target.value})}/>
      </Modal>

      {/* ── Edit Shop Modal ── */}
      <Modal open={editModal} onClose={()=>sEM(false)} title={`Edit — ${editShop?.shop_name||""}`}
        footer={<><Btn onClick={()=>sEM(false)}>Cancel</Btn><Btn primary onClick={saveEdit} disabled={saving}>{saving?"Saving…":"Save Changes"}</Btn></>}>
        <ErrMsg msg={err}/>
        <Field label="Shop Name" placeholder="e.g. Cafe Javas" value={editForm.shop_name} onChange={e=>sEF({...editForm,shop_name:e.target.value})}/>
        <Field label="Phone"     placeholder="9876543210"       value={editForm.phone}     onChange={e=>sEF({...editForm,phone:e.target.value})}/>
        <Field label="Address"   placeholder="Street, City"     value={editForm.address}   onChange={e=>sEF({...editForm,address:e.target.value})}/>
        <div style={{padding:"9px 12px",background:"var(--s2)",borderRadius:7,fontSize:10,color:"var(--muted)",display:"flex",gap:16,flexWrap:"wrap"}}>
          <span>Current name: <span style={{color:"var(--text)"}}>{editShop?.shop_name}</span></span>
          <span>Phone: <span style={{color:"var(--text)"}}>{editShop?.phone||"—"}</span></span>
        </div>
      </Modal>
      {/* ── Quick Place Order Modal ── */}
<Modal open={orderModal} onClose={()=>sOM(false)}
  title={`Place Order — ${orderShop?.shop_name||""}`}
  footer={
    <><Btn onClick={()=>sOM(false)}>Cancel</Btn>
    <Btn primary onClick={placeOrder} disabled={orderSaving}>
      {orderSaving?"Placing…":"Place Order"}
    </Btn></>
  }
>
  <ErrMsg msg={orderErr}/>
  <div style={{marginBottom:14,padding:"10px 12px",background:"var(--s2)",borderRadius:7,fontSize:11,color:"var(--muted)",display:"flex",gap:16,flexWrap:"wrap"}}>
    <span>Shop: <span style={{color:"var(--text)",fontWeight:500}}>{orderShop?.shop_name}</span></span>
    {orderShop?.phone&&<span>📞 <span style={{color:"var(--text)"}}>{orderShop.phone}</span></span>}
  </div>
  <ProductRows rows={orderRows} setRows={sOR} products={prods}/>
  <div style={{marginTop:10,fontSize:10,color:"var(--muted)"}}>
    📨 Telegram notification sent automatically
  </div>
</Modal>
    </div>
  );
};
// ──PRODUCTS ──────────────────────────────────────────────────────────────────
const Products = ({ toast }) => {
  const [prods,  sP]  = useState([]);
  const [load,   sL]  = useState(true);
  const [modal,  sM]  = useState(false);
  const [saving, sSv] = useState(false);
  const [editModal, sEM]  = useState(false);
  const [editProd,  sEP]  = useState(null);
  const [form,   sF]  = useState({ name: "", price: "", mrp: "", qty: "" });
  const [editForm, sEF]   = useState({ name: "", price: "", mrp: "", qty: "" });
  const [err,    sErr]= useState("");

  const load_ = useCallback(() => {
    sL(true);
    api.get("/products/products")
      .then(r => sP(r.data || []))
      .catch(() => sP([]))
      .finally(() => sL(false));
  }, []);

  useEffect(() => { load_(); }, []);

  // ── Add ──
  const add = async () => {
    sErr(""); sSv(true);
    try {
      await api.post("/products/product", {
        name:  form.name,
        price: parseFloat(form.price),
        mrp:   parseFloat(form.mrp),
        qty:   parseInt(form.qty),
      });
      toast("📦", "Product added!");
      sM(false);
      sF({ name: "", price: "", mrp: "", qty: "" });
      load_();
    } catch (e) {
      sErr(e.response?.data?.detail || "Failed to add product");
    } finally { sSv(false); }
  };

  // ── Open Edit ──
  const openEdit = (product) => {
    sEP(product);
    sEF({
      name:  product.name,
      price: String(product.price),
      mrp:   String(product.mrp),
      qty:   String(product.qty),
    });
    sErr("");
    sEM(true);
  };

  // ── Save Edit ──
  const saveEdit = async () => {
    if (!editProd?.id) return;
    sErr(""); sSv(true);
    try {
      await api.patch(`/products/product/${editProd.id}`, {
        name:  editForm.name  || undefined,
        price: editForm.price ? parseFloat(editForm.price) : undefined,
        mrp:   editForm.mrp   ? parseFloat(editForm.mrp)   : undefined,
        qty:   editForm.qty   ? parseInt(editForm.qty)      : undefined,
      });
      toast("✏️", "Product updated!");
      sEM(false);
      load_();
    } catch (e) {
      sErr(e.response?.data?.detail || "Failed to update product");
    } finally { sSv(false); }
  };

  // ── Delete ──
  const del = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/product/${id}`);
      toast("🗑️", "Deleted");
      load_();
    } catch (e) {
      toast("❌", e.response?.data?.detail || "Failed to delete");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <Btn primary onClick={() => { sErr(""); sM(true); }}>+ Add Product</Btn>
      </div>

      <Card>
        {load ? <Spin /> : (
          <div className="tbl-wrap">
            <table className="tbl" style={{ minWidth: 340 }}>
              <thead>
                <tr>
                  <th className="th">Name</th>
                  <th className="th">Price</th>
                  <th className="th">MRP</th>
                  <th className="th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prods.length > 0 ? prods.map(p => (
                  <tr key={p.id} className="tr">
                    <td className="td" style={{ fontWeight: 500 }}>{p.name}</td>
                    <td className="td" style={{ color: "var(--accent)" }}>₹{p.price}</td>
                    <td className="td" style={{ color: "var(--muted)" }}>₹{p.mrp}</td>
                    <td className="td">
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn small onClick={() => openEdit(p)}>✏️ Edit</Btn>
                        <Btn small danger onClick={() => del(p.id)}>🗑️</Btn>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} style={{ padding: "32px 0", textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Add Modal ── */}
      <Modal open={modal} onClose={() => sM(false)} title="Add New Product"
        footer={
          <>
            <Btn onClick={() => sM(false)}>Cancel</Btn>
            <Btn primary onClick={add} disabled={saving}>{saving ? "Saving…" : "Add Product"}</Btn>
          </>
        }
      >
        <ErrMsg msg={err} />
        <Field label="Product Name" placeholder="e.g. Product A"
          value={form.name}  onChange={e => sF({ ...form, name: e.target.value })} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Price" type="number" placeholder="50"
            value={form.price} onChange={e => sF({ ...form, price: e.target.value })} />
          <Field label="MRP"   type="number" placeholder="65"
            value={form.mrp}   onChange={e => sF({ ...form, mrp: e.target.value })} />
        </div>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal open={editModal} onClose={() => sEM(false)}
        title={`Edit Product — ${editProd?.name || ""}`}
        footer={
          <>
            <Btn onClick={() => sEM(false)}>Cancel</Btn>
            <Btn primary onClick={saveEdit} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Btn>
          </>
        }
      >
        <ErrMsg msg={err} />
        <Field label="Product Name" placeholder="e.g. Product A"
          value={editForm.name}  onChange={e => sEF({ ...editForm, name: e.target.value })} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Price" type="number" placeholder="50"
            value={editForm.price} onChange={e => sEF({ ...editForm, price: e.target.value })} />
          <Field label="MRP"   type="number" placeholder="65"
            value={editForm.mrp}   onChange={e => sEF({ ...editForm, mrp: e.target.value })} />
        </div>

        {/* show current values as reference */}
        <div style={{ marginTop: 4, padding: "9px 12px", background: "var(--s2)", borderRadius: 7, fontSize: 10, color: "var(--muted)", display: "flex", gap: 16, flexWrap: "wrap" }}>
          <span>Current price: <span style={{ color: "var(--accent)" }}>₹{editProd?.price}</span></span>
          <span>Current MRP: <span style={{ color: "var(--text)" }}>₹{editProd?.mrp}</span></span>
          <span>Current stock: <span style={{ color: "var(--text)" }}>{editProd?.qty}</span></span>
        </div>
      </Modal>
    </div>
  );
};
// ── SUMMARY ────────────────────────────────────────────────────────────────
const Summary = ({toast})=>{
  const [date,sD]=useState(new Date().toISOString().split("T")[0]);
  const [data,sDt]=useState(null); const [load,sL]=useState(false);

  const fetch_=async()=>{
    sL(true);
    try{
      const r=await api.get(`/orders/summary/${date}`);
      sDt(r.data); toast("📊","Summary fetched! 📱 Tele sent");
    } catch{ toast("❌","No orders found for this date"); sDt(null); }
    finally{ sL(false); }
  };

  const maxQ=data?.summary?.reduce((a,s)=>Math.max(a,s.total_quantity),1)||1;

  return (
    <div>
      <div style={{display:"flex",gap:9,marginBottom:18,flexWrap:"wrap",alignItems:"center"}}>
        <input type="date" value={date} onChange={e=>sD(e.target.value)}
          style={{background:"var(--s2)",border:"1px solid var(--border)",borderRadius:7,padding:"8px 12px",fontFamily:"var(--font)",fontSize:11,color:"var(--text)",outline:"none"}}/>
        <Btn primary onClick={fetch_} disabled={load}>{load?"Fetching…":"Fetch Summary"}</Btn>
        {data&&<span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 9px",background:"rgba(108,99,255,.1)",border:"1px solid rgba(108,99,255,.3)",borderRadius:20,fontSize:10,color:"#8f88ff"}}>
  <span style={{width:5,height:5,borderRadius:"50%",background:"#8f88ff",display:"inline-block"}}/>
  📨 Telegram Sent
</span>}
      </div>

      {data?(
        <div className="g2">
          <Card>
            <CardHead title="📦 Products to Pack" action={<span style={{fontSize:10,color:"var(--muted)"}}>{data.summary?.length||0} items</span>}/>
            <div style={{padding:18}}>
              {load?<Spin/>:data.summary?.length>0?data.summary.map((s,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:11,padding:"9px 0",borderBottom:i<data.summary.length-1?"1px solid rgba(37,37,56,.8)":"none"}}>
                  <div style={{flex:1,fontSize:12}}>{s.product_name}</div>
                  <div style={{width:70,height:3,background:"var(--border)",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${(s.total_quantity/maxQ)*100}%`,background:"linear-gradient(90deg,var(--accent),var(--a2))",borderRadius:2,transition:"width .6s ease"}}/>
                  </div>
                  <div style={{fontFamily:"var(--display)",fontWeight:700,fontSize:15,color:"var(--accent)",minWidth:28,textAlign:"right"}}>{s.total_quantity}</div>
                </div>
              )):<div style={{textAlign:"center",color:"var(--muted)",fontSize:12,padding:24}}>No products for this date</div>}
            </div>
          </Card>
          <Card>
            <CardHead title="📊 Day Stats"/>
            <div style={{padding:18}}>
              {[
                {label:"Date",           val:data.date,                                             color:"var(--text)"},
                {label:"Product Types",  val:data.summary?.length||0,                               color:"var(--accent)"},
                {label:"Total Units",    val:data.summary?.reduce((a,s)=>a+s.total_quantity,0)||0,  color:"var(--a2)"},
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:i<2?"1px solid rgba(37,37,56,.8)":"none"}}>
                  <div style={{fontSize:12,color:"var(--muted)"}}>{s.label}</div>
                  <div style={{fontFamily:"var(--display)",fontWeight:700,fontSize:18,color:s.color}}>{s.val}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ):(
        <Card style={{padding:56}}>
          <div style={{textAlign:"center",color:"var(--muted)"}}>
            <div style={{fontSize:32,marginBottom:12}}>◰</div>
            <div style={{fontSize:13,marginBottom:4}}>Select a date and fetch summary</div>
            <div style={{fontSize:11}}>Shows total packing quantity per product for that day</div>
          </div>
        </Card>
      )}
    </div>
  );
};

// ── USERS ──────────────────────────────────────────────────────────────────
const Users = ({toast})=>{
  const [users,sU]=useState([]); const [load,sL]=useState(true);
  const [modal,sM]=useState(false); const [saving,sSv]=useState(false);
  const [form,sF]=useState({name:"",email:"",password:"",role:"salesman"});
  const [err,sErr]=useState("");

  const user = JSON.parse(localStorage.getItem("de_user")||"{}");
  const isAdmin = user.role === "admin";

  const load_=useCallback(()=>{
    sL(true);
    api.get("/auth/users").then(r=>sU(r.data||[])).catch(()=>sU([])).finally(()=>sL(false));
  },[]);
  useEffect(()=>load_(),[]);

  const add=async()=>{
    sErr(""); sSv(true);
    try{
      await api.post("/auth/register",form);
      toast("👤","User created!"); sM(false);
      sF({name:"",email:"",password:"",role:"salesman"}); load_();
    } catch(e){ sErr(e.response?.data?.detail||"Failed"); }
    finally{ sSv(false); }
  };

  const del=async(id, name)=>{
    if(!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try{
      await api.delete(`/auth/user/${id}`);
      toast("🗑️",`${name} deleted`); load_();
    } catch(e){ toast("❌", e.response?.data?.detail||"Failed to delete"); }
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
        {isAdmin&&<Btn primary onClick={()=>{sErr("");sM(true);}}>+ Add User</Btn>}
      </div>
      <Card>
        {load?<Spin/>:(
          <div className="tbl-wrap">
            <table className="tbl" style={{minWidth:320}}>
              <colgroup>
                <col style={{width:"50px"}}/><col/><col style={{width:"160px"}}/><col style={{width:"110px"}}/>
                {isAdmin&&<col style={{width:"70px"}}/>}
              </colgroup>
              <thead><tr>
                <th className="th">ID</th><th className="th">Name</th>
                <th className="th hide-sm">Email</th>
                <th className="th">Role</th>
                {isAdmin&&<th className="th"></th>}
              </tr></thead>
              <tbody>
                {users.length>0?users.map(u=>(
                  <tr key={u.id} className="tr">
                    <td className="td">{u.id}</td>
                    <td className="td" style={{fontWeight:500}}>
                      {u.name}
                      {/* mark current user */}
                      {u.email===user.email&&
                        <span style={{marginLeft:7,fontSize:9,color:"var(--accent)",background:"rgba(0,229,160,.1)",padding:"1px 6px",borderRadius:10,border:"1px solid rgba(0,229,160,.2)"}}>you</span>
                      }
                    </td>
                    <td className="td hide-sm" style={{color:"var(--muted)",fontSize:11}}>{u.email}</td>
                    <td className="td"><RoleBadge role={u.role}/></td>
                    {isAdmin&&(
                      <td className="td">
                        {/* hide delete button for current user */}
                        {u.email!==user.email&&(
                          <Btn small danger onClick={()=>del(u.id, u.name)}>🗑️</Btn>
                        )}
                      </td>
                    )}
                  </tr>
                )):<tr><td colSpan={isAdmin?5:4} style={{padding:"32px 0",textAlign:"center",color:"var(--muted)",fontSize:12}}>No users found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modal} onClose={()=>sM(false)} title="Add New User"
        footer={<><Btn onClick={()=>sM(false)}>Cancel</Btn><Btn primary onClick={add} disabled={saving}>{saving?"Saving…":"Create User"}</Btn></>}>
        <ErrMsg msg={err}/>
        <Field label="Full Name"  placeholder="e.g. Rahul Sales"      value={form.name}     onChange={e=>sF({...form,name:e.target.value})}/>
        <Field label="Email"      type="email" placeholder="rahul@sales.com" value={form.email}    onChange={e=>sF({...form,email:e.target.value})}/>
        <Field label="Password"   type="password" placeholder="min 8 chars"  value={form.password} onChange={e=>sF({...form,password:e.target.value})}/>
        <Drop label="Role" value={form.role} onChange={e=>sF({...form,role:e.target.value})}
          options={[{value:"salesman",label:"Salesman"},{value:"packing",label:"Packing"},{value:"admin",label:"Admin"}]}/>
      </Modal>
    </div>
  );
};

export default function App(){
  const [auth,sA]  = useState(!!localStorage.getItem("de_token"));
  const [page,sP]  = useState("dashboard");
  const [side,sSd] = useState(false);
  const [toasts,sT]= useState([]);
  const [signOutConfirm,sSOC] = useState(false);  // ← add this

  const toast=(icon,msg)=>{
    const id=Date.now(); sT(t=>[...t,{id,icon,msg}]);
    setTimeout(()=>sT(t=>t.filter(x=>x.id!==id)),3200);
  };
  const logout=()=>{
    localStorage.removeItem("de_token");
    localStorage.removeItem("de_user");
    sA(false);
  };
  const user=JSON.parse(localStorage.getItem("de_user")||"{}");
  const goTo=(id)=>{ sP(id); sSd(false); };

  const PAGES = {
    dashboard:<Dashboard/>,
    orders:   <Orders   toast={toast}/>,
    shops:    <Shops    toast={toast}/>,
    products: <Products toast={toast}/>,
    summary:  <Summary  toast={toast}/>,
    users:    <Users    toast={toast}/>,
  };

  if(!auth) return <><style>{CSS}</style><Login onLogin={()=>sA(true)}/></>;

  return (
    <>
      <style>{CSS}</style>

      {/* ── Confirm Sign Out Modal ── */}
      <ConfirmModal
        open={signOutConfirm}
        onCancel={()=>sSOC(false)}
        onConfirm={()=>{ sSOC(false); logout(); }}
        title="Sign Out?"
        message="You will be logged out of distributeEase. Any unsaved changes will be lost."
        confirmLabel="Yes, Sign Out"
        danger={true}
      />

      {/* Mobile overlay */}
      <div className={`overlay ${side?"show":""}`} onClick={()=>sSd(false)}/>

      <div className="app-shell">

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar ${side?"open":""}`}>
          <div style={{padding:"20px 18px",borderBottom:"1px solid var(--border)",flexShrink:0}}>
            <div style={{fontFamily:"var(--display)",fontSize:19,fontWeight:800,letterSpacing:-.5}}>
              distribute<span style={{color:"var(--accent)"}}>Ease</span>
            </div>
            <div style={{fontSize:9,color:"var(--muted)",letterSpacing:2.5,textTransform:"uppercase",marginTop:3}}>Distribution Mgmt</div>
          </div>

          <nav style={{flex:1,padding:10,overflowY:"auto"}}>
            {NAV.map(n=>(
              <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>goTo(n.id)}>
                <div className="nav-pip"/>
                <span style={{fontSize:14,width:18,textAlign:"center",flexShrink:0}}>{n.icon}</span>
                <span style={{flex:1}}>{n.label}</span>
                {n.badge&&<span style={{background:"rgba(0,229,160,.12)",color:"var(--accent)",fontSize:9,padding:"1px 6px",borderRadius:20,border:"1px solid rgba(0,229,160,.25)"}}>{n.badge}</span>}
              </div>
            ))}
          </nav>

          <div style={{padding:12,borderTop:"1px solid var(--border)",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:9,padding:10,background:"var(--s2)",borderRadius:8,border:"1px solid var(--border)",marginBottom:9}}>
              <div style={{width:30,height:30,borderRadius:7,background:"linear-gradient(135deg,var(--accent),var(--a2))",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--display)",fontWeight:800,fontSize:12,color:"#000",flexShrink:0}}>
                {user.name?.[0]?.toUpperCase()||"U"}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name||"User"}</div>
                <div style={{fontSize:9,color:"var(--accent)",textTransform:"uppercase",letterSpacing:1.2,marginTop:1}}>{user.role?.replace("_"," ")||"—"}</div>
              </div>
            </div>
            {/* ← changed to open confirm modal */}
            <Btn full onClick={()=>sSOC(true)} style={{fontSize:11}}>Sign Out</Btn>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="main-wrap">
          <div className="topbar">
            <button className="hbg-btn" onClick={()=>sSd(true)}>☰</button>
            <div style={{fontFamily:"var(--display)",fontSize:18,fontWeight:700,flex:1}}>
              {NAV.find(n=>n.id===page)?.label}
            </div>
            <div className="hide-sm" style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 9px",background:"rgba(37,211,102,.08)",border:"1px solid rgba(37,211,102,.2)",borderRadius:20,fontSize:9,color:"#25d366",letterSpacing:.5}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:"#25d366",animation:"pulse 2s infinite",display:"inline-block"}}/>
              LIVE
            </div>
          </div>

          <div className="page-content">
            {PAGES[page]}
          </div>
        </main>

      </div>

      <Toast toasts={toasts}/>
      <Analytics />
    </>
  );
}