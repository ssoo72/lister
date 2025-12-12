'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Company, CompanyUpdate } from '@/lib/api';
import styles from './edit.module.css';

export default function EditCompany() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<CompanyUpdate>({});
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      const id = parseInt(params.id as string);
      const data = await api.getCompany(id);
      setFormData({
        company_name: data.company_name,
        industry: data.industry,
        job_type: data.job_type,
        status: data.status,
        priority: data.priority,
        es_deadline: data.es_deadline ? data.es_deadline.split('T')[0] : undefined,
        es_submitted: data.es_submitted,
        interview_count: data.interview_count,
        next_interview_date: data.next_interview_date,
        website_url: data.website_url,
        recruit_url: data.recruit_url,
        mypage_id: data.mypage_id,
        mypage_password: data.mypage_password,
        salary: data.salary,
        location: data.location,
        notes: data.notes,
        interview_notes: data.interview_notes,
      });
    } catch (error) {
      console.error('企業情報の取得に失敗しました', error);
      alert('企業情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const id = parseInt(params.id as string);
      // データをクリーンアップして送信
      const cleanData: CompanyUpdate = {};
      
      if (formData.company_name) cleanData.company_name = formData.company_name;
      if (formData.industry) cleanData.industry = formData.industry;
      if (formData.job_type) cleanData.job_type = formData.job_type;
      if (formData.status) cleanData.status = formData.status;
      if (formData.priority !== undefined && formData.priority !== null) {
        cleanData.priority = typeof formData.priority === 'string' 
          ? parseInt(formData.priority) 
          : formData.priority;
      }
      if (formData.es_deadline) cleanData.es_deadline = formData.es_deadline;
      if (formData.es_submitted !== undefined) cleanData.es_submitted = formData.es_submitted;
      if (formData.interview_count !== undefined && formData.interview_count !== null) {
        cleanData.interview_count = typeof formData.interview_count === 'string'
          ? parseInt(formData.interview_count)
          : formData.interview_count;
      }
      if (formData.next_interview_date) cleanData.next_interview_date = formData.next_interview_date;
      if (formData.website_url) cleanData.website_url = formData.website_url;
      if (formData.recruit_url) cleanData.recruit_url = formData.recruit_url;
      if (formData.mypage_id) cleanData.mypage_id = formData.mypage_id;
      if (formData.mypage_password) cleanData.mypage_password = formData.mypage_password;
      if (formData.salary) cleanData.salary = formData.salary;
      if (formData.location) cleanData.location = formData.location;
      if (formData.notes) cleanData.notes = formData.notes;
      if (formData.interview_notes) cleanData.interview_notes = formData.interview_notes;
      
      console.log('Sending update data:', cleanData);
      await api.updateCompany(id, cleanData);
      alert('企業情報を更新しました');
      router.push(`/companies/${id}`);
    } catch (error: any) {
      console.error('更新に失敗しました', error);
      const errorMessage = error.response?.data?.detail || error.message || '更新に失敗しました';
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
    if (!formData.company_name?.trim()) {
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

  if (loading) {
    return <div className={styles.container}>読み込み中...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>企業情報を編集</h1>
        <Link href={`/companies/${params.id}`} className={styles.backButton}>
          ← 詳細に戻る
        </Link>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>企業名 <span className={styles.required}>*</span></label>
          <div className={styles.companyNameRow}>
            <input
              type="text"
              name="company_name"
              value={formData.company_name || ''}
              onChange={handleChange}
              required
              className={styles.companyNameInput}
            />
            <button
              type="button"
              onClick={handleAutoFill}
              disabled={isLoadingAI || !formData.company_name?.trim()}
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
              value={formData.industry || ''}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>職種</label>
            <input
              type="text"
              name="job_type"
              value={formData.job_type || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>選考状況</label>
            <select name="status" value={formData.status || ''} onChange={handleChange}>
              <option value="エントリー済み">エントリー済み</option>
              <option value="書類選考中">書類選考中</option>
              <option value="面接中">面接中</option>
              <option value="内定">内定</option>
              <option value="不合格">不合格</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>優先度</label>
            <select name="priority" value={formData.priority || 3} onChange={handleChange}>
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
              value={formData.interview_count || 0}
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
            />
          </div>

          <div className={styles.formGroup}>
            <label>採用サイトURL</label>
            <input
              type="url"
              name="recruit_url"
              value={formData.recruit_url || ''}
              onChange={handleChange}
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
            />
          </div>

          <div className={styles.formGroup}>
            <label>マイページパスワード</label>
            <input
              type="password"
              name="mypage_password"
              value={formData.mypage_password || ''}
              onChange={handleChange}
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
            />
          </div>

          <div className={styles.formGroup}>
            <label>勤務地</label>
            <input
              type="text"
              name="location"
              value={formData.location || ''}
              onChange={handleChange}
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
          />
        </div>

        <div className={styles.formGroup}>
          <label>面接メモ</label>
          <textarea
            name="interview_notes"
            value={formData.interview_notes || ''}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>
            更新する
          </button>
          <Link href={`/companies/${params.id}`} className={styles.cancelButton}>
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
