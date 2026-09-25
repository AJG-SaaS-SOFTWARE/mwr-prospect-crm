'use client';
import {useState} from 'react';
import {createClient} from '../../lib/supabase/client';

export default function Login(){
 const[email,setEmail]=useState(''); const[password,setPassword]=useState(''); const[msg,setMsg]=useState(''); const[busy,setBusy]=useState(false);
 async function submit(e){e.preventDefault();setBusy(true);setMsg('');const supabase=createClient();const{error}=await supabase.auth.signInWithPassword({email,password});if(error){setMsg(error.message);setBusy(false);return}window.location.href='/';}
 return <main className="loginPage"><div className="loginCard"><div className="loginMark">PF</div><small>PROSPECTFLOW CRM</small><h1>Connexion</h1><p>Accède à ton espace de prospection sécurisé.</p><form onSubmit={submit}><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@exemple.fr"/></label><label>Mot de passe<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/></label>{msg&&<div className="formError">{msg}</div>}<button className="primary loginBtn" disabled={busy}>{busy?'Connexion…':'Se connecter'}</button></form><div className="loginNote">Prospection responsable · Données isolées par compte</div></div></main>
}