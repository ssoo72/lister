'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Company } from '@/lib/api';
import styles from './page.module.css';

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    sortBy: 'created_at',
    order: 'desc',
  });

  useEffect(() => {
    loadCompanies();
  }, [filter]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await api.getCompanies({
        status: filter.status || undefined,
        sort_by: filter.sortBy,
        order: filter.order,
      });
      setCompanies(data);
    } catch (error) {
      console.error('企業一覧の取得に失敗しました', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか?')) return;
    
    try {
      await api.deleteCompany(id);
      loadCompanies();
    } catch (error) {
      console.error('削除に失敗しました', error);
      alert('削除に失敗しました');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '内定': return '#4caf50';
      case '面接中': return '#2196f3';
      case '書類選考中': return '#ff9800';
      case '不合格': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>就活管理アプリ</h1>
        <div className={styles.headerButtons}>
          <Link href="/companies/new" className={styles.addButton}>
            + 企業を追加
          </Link>
        </div>
      </header>

      <div className={styles.filters}>
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className={styles.select}
        >
          <option value="">すべての状態</option>
          <option value="エントリー済み">エントリー済み</option>
          <option value="書類選考中">書類選考中</option>
          <option value="面接中">面接中</option>
          <option value="内定">内定</option>
          <option value="不合格">不合格</option>
        </select>

        <select
          value={filter.sortBy}
          onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
          className={styles.select}
        >
          <option value="created_at">登録日順</option>
          <option value="company_name">企業名順</option>
          <option value="priority">優先度順</option>
          <option value="es_deadline">ES締切順</option>
        </select>

        <select
          value={filter.order}
          onChange={(e) => setFilter({ ...filter, order: e.target.value })}
          className={styles.select}
        >
          <option value="desc">降順</option>
          <option value="asc">昇順</option>
        </select>
      </div>

      {loading ? (
        <div className={styles.loading}>読み込み中...</div>
      ) : companies.length === 0 ? (
        <div className={styles.empty}>
          <p>まだ企業が登録されていません</p>
          <Link href="/companies/new">最初の企業を追加する</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {companies.map((company) => (
            <div key={company.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>{company.company_name}</h2>
                <span 
                  className={styles.status}
                  style={{ backgroundColor: getStatusColor(company.status) }}
                >
                  {company.status}
                </span>
              </div>
              
              <div className={styles.cardBody}>
                {company.industry && <p><strong>業界:</strong> {company.industry}</p>}
                {company.job_type && <p><strong>職種:</strong> {company.job_type}</p>}
                {company.location && <p><strong>勤務地:</strong> {company.location}</p>}
                {company.es_deadline && (
                  <p><strong>ES締切:</strong> {new Date(company.es_deadline).toLocaleDateString('ja-JP')}</p>
                )}
                <p><strong>優先度:</strong> {'★'.repeat(6 - company.priority)}</p>
              </div>

              <div className={styles.cardFooter}>
                <Link href={`/companies/${company.id}`} className={styles.viewButton}>
                  詳細
                </Link>
                <Link href={`/companies/${company.id}/edit`} className={styles.editButton}>
                  編集
                </Link>
                <button
                  onClick={() => handleDelete(company.id)}
                  className={styles.deleteButton}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
