'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Company } from '@/lib/api';
import styles from './detail.module.css';

export default function CompanyDetail() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      const id = parseInt(params.id as string);
      const data = await api.getCompany(id);
      setCompany(data);
    } catch (error) {
      console.error('企業情報の取得に失敗しました', error);
      alert('企業情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('本当に削除しますか?')) return;
    
    try {
      const id = parseInt(params.id as string);
      await api.deleteCompany(id);
      alert('削除しました');
      router.push('/');
    } catch (error) {
      console.error('削除に失敗しました', error);
      alert('削除に失敗しました');
    }
  };

  if (loading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  if (!company) {
    return <div className={styles.error}>企業が見つかりませんでした</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{company.company_name}</h1>
        <Link href="/" className={styles.backButton}>← 一覧に戻る</Link>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2>基本情報</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>選考状況:</span>
              <span className={styles.value}>{company.status}</span>
            </div>
            {company.industry && (
              <div className={styles.infoItem}>
                <span className={styles.label}>業界:</span>
                <span className={styles.value}>{company.industry}</span>
              </div>
            )}
            {company.job_type && (
              <div className={styles.infoItem}>
                <span className={styles.label}>職種:</span>
                <span className={styles.value}>{company.job_type}</span>
              </div>
            )}
            {company.location && (
              <div className={styles.infoItem}>
                <span className={styles.label}>勤務地:</span>
                <span className={styles.value}>{company.location}</span>
              </div>
            )}
            {company.salary && (
              <div className={styles.infoItem}>
                <span className={styles.label}>初任給:</span>
                <span className={styles.value}>{company.salary}</span>
              </div>
            )}
            <div className={styles.infoItem}>
              <span className={styles.label}>優先度:</span>
              <span className={styles.value}>{'★'.repeat(6 - company.priority)}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>選考情報</h2>
          <div className={styles.infoGrid}>
            {company.es_deadline && (
              <div className={styles.infoItem}>
                <span className={styles.label}>ES締切:</span>
                <span className={styles.value}>
                  {new Date(company.es_deadline).toLocaleDateString('ja-JP')}
                </span>
              </div>
            )}
            <div className={styles.infoItem}>
              <span className={styles.label}>ES提出:</span>
              <span className={styles.value}>{company.es_submitted ? '済' : '未'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>面接回数:</span>
              <span className={styles.value}>{company.interview_count}回</span>
            </div>
            {company.next_interview_date && (
              <div className={styles.infoItem}>
                <span className={styles.label}>次の面接:</span>
                <span className={styles.value}>
                  {new Date(company.next_interview_date).toLocaleString('ja-JP')}
                </span>
              </div>
            )}
          </div>
        </div>

        {(company.mypage_id || company.mypage_password) && (
          <div className={styles.section}>
            <h2>🔐 マイページ情報</h2>
            <div className={styles.infoGrid}>
              {company.mypage_id && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>ID:</span>
                  <span className={styles.value}>{company.mypage_id}</span>
                </div>
              )}
              {company.mypage_password && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>パスワード:</span>
                  <span className={styles.value}>{'•'.repeat(company.mypage_password.length)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {(company.website_url || company.recruit_url) && (
          <div className={styles.section}>
            <h2>リンク</h2>
            <div className={styles.links}>
              {company.website_url && (
                <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                  企業サイト →
                </a>
              )}
              {company.recruit_url && (
                <a href={company.recruit_url} target="_blank" rel="noopener noreferrer">
                  採用サイト →
                </a>
              )}
            </div>
          </div>
        )}

        {company.notes && (
          <div className={styles.section}>
            <h2>メモ</h2>
            <p className={styles.notes}>{company.notes}</p>
          </div>
        )}

        {company.interview_notes && (
          <div className={styles.section}>
            <h2>面接メモ</h2>
            <p className={styles.notes}>{company.interview_notes}</p>
          </div>
        )}

        <div className={styles.actions}>
          <Link href={`/companies/${company.id}/edit`} className={styles.editButton}>
            編集
          </Link>
          <button onClick={handleDelete} className={styles.deleteButton}>
            削除
          </button>
        </div>
      </div>
    </div>
  );
}
