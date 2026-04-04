'use client';

export interface FrontmatterState {
  title: string;
  category: string;
  subtitle: string;
  date: string;
  published: boolean;
}

interface Props {
  value: FrontmatterState;
  onChange: (v: FrontmatterState) => void;
  slug: string;
  onSlugChange?: (slug: string) => void;
  slugEditable: boolean;
  categories?: string[];
}

export function FrontmatterForm({
  value,
  onChange,
  slug,
  onSlugChange,
  slugEditable,
  categories = [],
}: Props) {
  function set<K extends keyof FrontmatterState>(key: K, val: FrontmatterState[K]) {
    onChange({ ...value, [key]: val });
  }

  const inputClass =
    'w-full px-2.5 py-1.5 rounded border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring';

  const labelClass = 'block text-xs text-muted-foreground mb-1';

  return (
    <div className='flex flex-wrap gap-x-3 gap-y-2 px-4 py-3 border-b border-border bg-card shrink-0'>
      {/* 제목 */}
      <div className='flex-[3] min-w-48'>
        <label className={labelClass}>제목 *</label>
        <input
          className={inputClass}
          placeholder='Post title'
          value={value.title}
          onChange={(e) => set('title', e.target.value)}
        />
      </div>

      {/* 슬러그 */}
      <div className='flex-[2] min-w-36'>
        <label className={labelClass}>
          슬러그 *
          {!slugEditable && (
            <span className='ml-1 text-muted-foreground/60'>(변경 불가)</span>
          )}
        </label>
        <input
          className={inputClass}
          placeholder='url-slug'
          value={slug}
          onChange={(e) => onSlugChange?.(e.target.value)}
          readOnly={!slugEditable}
          style={!slugEditable ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
        />
      </div>

      {/* 카테고리 */}
      <div className='w-36'>
        <label className={labelClass}>카테고리 *</label>
        <input
          className={inputClass}
          placeholder='js / react / ...'
          value={value.category}
          onChange={(e) => set('category', e.target.value)}
          list='admin-categories'
        />
        {categories.length > 0 && (
          <datalist id='admin-categories'>
            {categories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        )}
      </div>

      {/* 부제목 */}
      <div className='flex-[3] min-w-48'>
        <label className={labelClass}>부제목</label>
        <input
          className={inputClass}
          placeholder='짧은 설명 (선택)'
          value={value.subtitle}
          onChange={(e) => set('subtitle', e.target.value)}
        />
      </div>

      {/* 날짜 */}
      <div className='w-36'>
        <label className={labelClass}>날짜</label>
        <input
          type='date'
          className={inputClass}
          value={value.date}
          onChange={(e) => set('date', e.target.value)}
        />
      </div>

      {/* 공개 여부 */}
      <div className='flex flex-col justify-end pb-0.5'>
        <label className={labelClass}>공개</label>
        <label className='flex items-center gap-2 h-[34px] cursor-pointer text-sm text-foreground'>
          <input
            type='checkbox'
            checked={value.published}
            onChange={(e) => set('published', e.target.checked)}
            className='w-4 h-4 accent-primary'
          />
          {value.published ? '공개' : '비공개'}
        </label>
      </div>
    </div>
  );
}
