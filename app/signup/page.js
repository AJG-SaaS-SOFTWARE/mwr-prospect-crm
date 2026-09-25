'use client';
import {useState} from 'react';
import Link from 'next/link';
import {createClient} from '../../lib/supabase/client';

export default function Signup(){
 const[email,setEmail]=useState('');
 const[password,setPassword]=useState('');
 const[confirm,setConfirm]=useState('');
 const[message,setMessage]=useState('');
 const[success,setSuccess]=useState(false);
 const[busy,setBusy]=useState(false);
 async function submit(event){
  event.preventDefault();
  setMessage('');
  if(password!==confirm){setMessage('Les mots de passe ne correspondent pas.');return}
  if(password.length<12){setMessage('Choisissez un mot de passe d’au moins 12 caractères.');return}
  setBusy(true);
  const supabase=createClient();
  const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:`${window.location.origin}/auth/callback`}});
  setBusy(false);
  if(error){setMessage(error.message);return}
  if(data.session){window.location.assign('/');return}
  setSuccess(true);
  setPassword('');setConfirm('');
 }
 return <main className="loginPage"><div className="loginCard"><div className="loginMark">PF</div><small>PROSPECTFLOW CRM</small><h1>Créer mon compte</h1>
  {success?<><p>Un e-mail de confirmation a été envoyé si cette adresse peut être inscrite. Ouvrez le lien reçu, puis connectez-vous.</p><Link href="/login">Retour à la connexion</Link></>:<><p>Créez votre accès privé au CRM.</p><form onSubmit={submit}><label>Email<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Mot de passe<input type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e=>setPassword(e.target.value)}/></label><label>Confirmer le mot de passe<input type="password" autoComplete="new-password" minLength={12} required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>{message&&<div role="alert" className="formError">{message}</div>}<button className="primary loginBtn" disabled={busy}>{busy?'Création…':'Créer mon compte'}</button></form><div className="loginNote">Déjà inscrit ? <Link href="/login">Se connecter</Link></div></>}
 </div></main>
}
