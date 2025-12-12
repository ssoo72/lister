'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, CompanyCreate } from '@/lib/api';
import styles from './new.module.css';

export default function NewCompany() {
  const router = useRouter();
  const [formData, setFormData] = useState<CompanyCreate>({
    company_name: '',
    industry: '',
    job_type: '',
    status: 'エントリー済み',
    priority: 3,
    es_submitted: false,
    interview_count: 0,
  });
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 空文字列をundefinedに変換してクリーンなデータを送信
      const cleanData: CompanyCreate = {
        company_name: formData.company_name,
        status: formData.status,
        priority: formData.priority,
        es_submitted: formData.es_submitted,
        interview_count: formData.interview_count,
        industry: formData.industry || undefined,
        job_type: formData.job_type || undefined,
        es_deadline: formData.es_deadline || undefined,
        next_interview_date: formData.next_interview_date || undefined,
        website_url: formData.website_url || undefined,
        recruit_url: formData.recruit_url || undefined,
        mypage_id: formData.mypage_id || undefined,
        mypage_password: formData.mypage_password || undefined,
        salary: formData.salary || undefined,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
        interview_notes: formData.interview_notes || undefined,
      };
      
      await api.createCompany(cleanData);
      alert('企業を追加しました');
      router.push('/');
    } catch (error: any) {
      console.error('企業の追加に失敗しました', error);
      const errorMessage = error.response?.data?.detail || error.message || '企業の追加に失敗しました';
      alert(`エラー: ${errorMessage}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleAutoFill = async () => {
    if (!formData.company_name.trim()) {
      alert('企業名を入力してください');
      return;
    }

    setIsLoadingAI(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/ai/company-info/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company_name: formData.company_name }),
      });

      const data = await response.json();

      if (data.error) {
        alert(`AI による自動入力に失敗しました: ${data.error}`);
        return;
      }

      // AI で取得した情報をフォームに反映（既存の値は上書きしない）
      setFormData(prev => ({
        ...prev,
        industry: data.industry || prev.industry,
        job_type: data.job_type || prev.job_type,
        location: data.location || prev.location,
        salary: data.salary || prev.salary,
        website_url: data.website_url || prev.website_url,
      }));

      alert('AI による情報取得が完了しました！内容を確認してください。');
    } catch (error) {
      console.error('AI 自動入力エラー:', error);
      alert('AI による自動入力に失敗しました。サーバーが起動しているか確認してください。');
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>企業を追加</h1>
        <Link href="/" className={styles.backButton}>← 一覧に戻る</Link>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>企業名 <span className={styles.required}>*</span></label>
          <div className={styles.companyNameRow}>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              required
              placeholder="株式会社〇〇"
              className={styles.companyNameInput}
            />
            <button
              type="button"
              onClick={handleAutoFill}
              disabled={isLoadingAI || !formData.company_name.trim()}
              className={styles.aiButton}
            >
              {isLoadingAI ? '取得中...' : '🤖 AI自動入力'}
            </button>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>業界</label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              placeholder="IT、金融、製造など"
            />
          </div>

          <div className={styles.formGroup}>
            <label>職種</label>
            <input
              type="text"
              name="job_type"
              value={formData.job_type}
              onChange={handleChange}
              placeholder="エンジニア、営業など"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>選考状況</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="エントリー済み">エントリー済み</option>
              <option value="書類選考中">書類選考中</option>
              <option value="面接中">面接中</option>
              <option value="内定">内定</option>
              <option value="不合格">不合格</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>優先度</label>
            <select name="priority" value={formData.priority} onChange={handleChange}>
              <option value={1}>★★★★★ (最高)</option>
              <option value={2}>★★★★☆</option>
              <option value={3}>★★★☆☆</option>
              <option value={4}>★★☆☆☆</option>
              <option value={5}>★☆☆☆☆ (低)</option>
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>ES締切日</label>
            <input
              type="date"
              name="es_deadline"
              value={formData.es_deadline || ''}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>面接回数</label>
            <input
              type="number"
              name="interview_count"
              value={formData.interview_count}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>企業サイトURL</label>
            <input
              type="url"
              name="website_url"
              value={formData.website_url || ''}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label>採用サイトURL</label>
            <input
              type="url"
              name="recruit_url"
              value={formData.recruit_url || ''}
              onChange={handleChange}
              placeholder="https://example.com/recruit"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>マイページID</label>
            <input
              type="text"
              name="mypage_id"
              value={formData.mypage_id || ''}
              onChange={handleChange}
              placeholder="ログインID・受験番号など"
            />
          </div>

          <div className={styles.formGroup}>
            <label>マイページパスワード</label>
            <input
              type="password"
              name="mypage_password"
              value={formData.mypage_password || ''}
              onChange={handleChange}
              placeholder="パスワード"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>初任給</label>
            <input
              type="text"
              name="salary"
              value={formData.salary || ''}
              onChange={handleChange}
              placeholder="月給25万円"
            />
          </div>

          <div className={styles.formGroup}>
            <label>勤務地</label>
            <input
              type="text"
              name="location"
              value={formData.location || ''}
              onChange={handleChange}
              placeholder="東京都渋谷区"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>メモ</label>
          <textarea
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows={4}
            placeholder="企業についてのメモ、志望動機など"
          />
        </div>

        <div className={styles.formGroup}>
          <label>面接メモ</label>
          <textarea
            name="interview_notes"
            value={formData.interview_notes || ''}
            onChange={handleChange}
            rows={4}
            placeholder="面接で聞かれたこと、感想など"
          />
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>
            登録する
          </button>
          <Link href="/" className={styles.cancelButton}>
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
