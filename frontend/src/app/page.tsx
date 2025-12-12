'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Company } from '@/lib/api';
import styles from './page.module.css';

type SortKey = 'company_name' | 'industry' | 'job_type' | 'status' | 'priority' | 'es_deadline' | 'created_at';

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '' });
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
    key: 'created_at',
    direction: 'desc',
  });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [visibleColumns, setVisibleColumns] = useState({
    company_name: true,
    industry: true,
    job_type: true,
    status: true,
    priority: true,
    location: false,
    es_deadline: true,
    salary: false,
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await api.getCompanies({
        status: filter.status || undefined,
      });
      setCompanies(data);
    } catch (error) {
      console.error('企業一覧の取得に失敗しました', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: SortKey) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const sortedCompanies = [...companies].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    
    let comparison = 0;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.localeCompare(bVal, 'ja');
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal;
    } else {
      comparison = String(aVal).localeCompare(String(bVal), 'ja');
    }
    
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  const filteredCompanies = filter.status
    ? sortedCompanies.filter(c => c.status === filter.status)
    : sortedCompanies;

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

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`選択した${selectedIds.size}件を削除しますか?`)) return;
    
    try {
      await Promise.all(Array.from(selectedIds).map(id => api.deleteCompany(id)));
      setSelectedIds(new Set());
      loadCompanies();
    } catch (error) {
      console.error('一括削除に失敗しました', error);
      alert('一括削除に失敗しました');
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCompanies.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCompanies.map(c => c.id)));
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
          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleButton} ${viewMode === 'table' ? styles.active : ''}`}
              onClick={() => setViewMode('table')}
            >
              📊 表形式
            </button>
            <button
              className={`${styles.toggleButton} ${viewMode === 'card' ? styles.active : ''}`}
              onClick={() => setViewMode('card')}
            >
              📇 カード
            </button>
          </div>
          {selectedIds.size > 0 && (
            <button onClick={handleBulkDelete} className={styles.bulkDeleteButton}>
              選択した{selectedIds.size}件を削除
            </button>
          )}
          <Link href="/companies/new" className={styles.addButton}>
            + 企業を追加
          </Link>
        </div>
      </header>

      <div className={styles.filters}>
        <select
          value={filter.status}
          onChange={(e) => setFilter({ status: e.target.value })}
          className={styles.select}
        >
          <option value="">すべての状態</option>
          <option value="エントリー済み">エントリー済み</option>
          <option value="書類選考中">書類選考中</option>
          <option value="面接中">面接中</option>
          <option value="内定">内定</option>
          <option value="不合格">不合格</option>
        </select>

        {viewMode === 'table' && (
          <details className={styles.columnSelector}>
            <summary>表示列を選択</summary>
            <div className={styles.columnCheckboxes}>
              {Object.entries({
                company_name: '企業名',
                industry: '業界',
                job_type: '職種',
                status: 'ステータス',
                priority: '優先度',
                location: '勤務地',
                es_deadline: 'ES締切',
                salary: '初任給',
              }).map(([key, label]) => (
                <label key={key}>
                  <input
                    type="checkbox"
                    checked={visibleColumns[key as keyof typeof visibleColumns]}
                    onChange={(e) => setVisibleColumns({
                      ...visibleColumns,
                      [key]: e.target.checked
                    })}
                    disabled={key === 'company_name'}
                  />
                  {label}
                </label>
              ))}
            </div>
          </details>
        )}
      </div>

      {loading ? (
        <div className={styles.loading}>読み込み中...</div>
      ) : filteredCompanies.length === 0 ? (
        <div className={styles.empty}>
          <p>まだ企業が登録されていません</p>
          <Link href="/companies/new">最初の企業を追加する</Link>
        </div>
      ) : viewMode === 'table' ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxCell}>
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredCompanies.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                {visibleColumns.company_name && (
                  <th onClick={() => handleSort('company_name')} className={styles.sortable}>
                    企業名 {sortConfig.key === 'company_name' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                )}
                {visibleColumns.industry && (
                  <th onClick={() => handleSort('industry')} className={styles.sortable} style={{ width: '120px' }}>
                    業界 {sortConfig.key === 'industry' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                )}
                {visibleColumns.job_type && (
                  <th onClick={() => handleSort('job_type')} className={styles.sortable} style={{ width: '120px' }}>
                    職種 {sortConfig.key === 'job_type' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                )}
                {visibleColumns.status && (
                  <th onClick={() => handleSort('status')} className={styles.sortable} style={{ width: '110px' }}>
                    状態 {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                )}
                {visibleColumns.priority && (
                  <th onClick={() => handleSort('priority')} className={styles.sortable} style={{ width: '80px' }}>
                    優先度 {sortConfig.key === 'priority' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                )}
                {visibleColumns.location && <th style={{ width: '120px' }}>勤務地</th>}
                {visibleColumns.es_deadline && (
                  <th onClick={() => handleSort('es_deadline')} className={styles.sortable} style={{ width: '100px' }}>
                    ES締切 {sortConfig.key === 'es_deadline' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                )}
                {visibleColumns.salary && <th style={{ width: '120px' }}>初任給</th>}
                <th className={styles.actionsCell}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr key={company.id} className={selectedIds.has(company.id) ? styles.selected : ''}>
                  <td className={styles.checkboxCell}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(company.id)}
                      onChange={() => toggleSelect(company.id)}
                    />
                  </td>
                  {visibleColumns.company_name && (
                    <td className={styles.companyName}>
                      <Link href={`/companies/${company.id}`}>
                        {company.company_name}
                      </Link>
                    </td>
                  )}
                  {visibleColumns.industry && <td>{company.industry || '-'}</td>}
                  {visibleColumns.job_type && <td>{company.job_type || '-'}</td>}
                  {visibleColumns.status && (
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(company.status) }}
                      >
                        {company.status}
                      </span>
                    </td>
                  )}
                  {visibleColumns.priority && (
                    <td className={styles.priority}>
                      {'★'.repeat(6 - company.priority)}
                    </td>
                  )}
                  {visibleColumns.location && <td>{company.location || '-'}</td>}
                  {visibleColumns.es_deadline && (
                    <td className={styles.deadline}>
                      {company.es_deadline
                        ? new Date(company.es_deadline).toLocaleDateString('ja-JP')
                        : '-'}
                    </td>
                  )}
                  {visibleColumns.salary && <td>{company.salary || '-'}</td>}
                  <td className={styles.actionsCell}>
                    <div className={styles.actions}>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredCompanies.map((company) => (
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
