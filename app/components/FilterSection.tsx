'use client';

import React, { useState } from 'react';
import Icon from './customcomponents/Icon';
import CustomInput from './customcomponents/CustomInput';
import PriceFilterSlider from './customcomponents/PriceFilterSlider';
import { useTheme } from '../contexts/ThemeContext';
import { useAppSelector } from '../redux/hooks';
import { RootState } from '../redux/store';
import { useRouter, useSearchParams } from 'next/navigation';
// Mock data interfaces
interface Category {
  sub_category_id: number;
  sub_category_name: string;
}

interface FilterSectionProps {
  filters?: {
    categories?: string[];
    sizes?: string[];
    priceRange?: [number, number];
    sort_by?: string | null;
  };
  categories?: Category[];
  searchQuery?: string;
  activeFilterCount?: number;
  themeId?: number;
  // UI-only handlers (placeholders)
  handleCheckboxChange?: (filterType: string, value: string) => void;
  handleFilterChange?: (
    filterType: string,
    value: string[] | [number, number] | null
  ) => void;
  clearAllFilters?: () => void;
  setFilters?: (filters: any) => void;
}

export default function FilterSection({
  filters = {
    categories: [],
    sizes: [],
    priceRange: [100, 49999],
    sort_by: null,
  },
  categories = [],
  searchQuery = '',
  activeFilterCount = 0,
  themeId = 1,
  handleCheckboxChange,
  handleFilterChange,
  clearAllFilters,
}: FilterSectionProps) {
  const [openAccordion, setOpenAccordion] = useState({
    category: true,
    size: false,
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  const themeContext = useTheme() || {};
  const { textColor } = themeContext;

  const [categorySearch, setCategorySearch] = useState('');
  const [sizeSearch, setSizeSearch] = useState('');

  const { productVariations } = useAppSelector(
    (state: RootState) => state.products
  );

  const toggleAccordion = (key: 'category' | 'size') => {
    setOpenAccordion((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setCategorySearch('');
    setSizeSearch('');
  };

  const categoriesArray = Array.isArray(categories) ? categories : [];
  const productVariationsArray = Array.isArray(productVariations)
    ? productVariations
    : [];

  const filteredCategories = categoriesArray.filter((category) =>
    category?.sub_category_name
      ?.toLowerCase()
      .includes(categorySearch.toLowerCase())
  );

  const filteredSizes = productVariationsArray.filter((size) =>
    size?.toLowerCase().includes(sizeSearch.toLowerCase())
  );
 const handleRemoveSearch = () => {
  if (!searchParams) return;

  const params = new URLSearchParams(searchParams.toString());

  params.delete('search');   // ✅ remove search
  params.set('page', '1');   // reset pagination

  router.push(`/shop?${params.toString()}`);
};


  return (
    <div
      className='filter-section'
      style={{
        background:
          themeId === 6 ? `${themeContext?.bottomFooterBackgroundColor}1A` : '',
        border:
          themeId === 6
            ? `1px solid ${themeContext?.bottomFooterBackgroundColor}`
            : '',
        padding: themeId === 6 ? '1rem' : '',
      }}
    >
      {/* Active Filter Chips */}
      {(themeId === 1 || themeId === 3 || themeId === 4 || themeId === 5) && (
        <div
          className={`filter-active-filters-wrapper ${activeFilterCount > 0 ? 'filter-visible-lg' : ''
            }`}
        >
          <div className='filter-active-filters-container'>
            <div className='filter-header-row'>
              <h4 className='filter-title case-class'>
                Filter By <span>({activeFilterCount})</span>
              </h4>
              <span
                className={`filter-clear-all filter-clear-all-link ${themeId === 3 ? 'filter-clear-all-link-theme3' : ''
                  }`}
                onClick={clearAllFilters}
                style={{
                  color: textColor,
                }}
              >
                Clear All
              </span>
            </div>

            {/* Active Filters Display */}
            <div className='filter-chips-container'>
              {searchQuery && (
                <span className='filter-chip-item filter-chip-base'>
                  Search:
                  <span className='line-clamp-1 w-20'>{searchQuery}</span>
                  <div onClick={handleRemoveSearch}>
                    <Icon
                      name={'close'}
                      stroke={'#111111'}
                      className='filter-icon-wrapper'
                    />
                  </div>
                </span>
              )}

              {filters?.categories?.map((categoryName) => {
                const category = categoriesArray.find(
                  (cat) =>
                    cat.sub_category_name.toLowerCase() ===
                    categoryName.toLowerCase()
                );
                if (!category) return null;
                return (
                  <span
                    key={category.sub_category_id}
                    className='filter-chip-item filter-chip-base'
                  >
                    {category?.sub_category_name}
                    <div
                      onClick={() =>
                        handleCheckboxChange(
                          'categories',
                          category.sub_category_id.toString()
                        )
                      }
                    >
                      <Icon
                        name={'close'}
                        stroke={'#111111'}
                        strokeWidth='1'
                        className='filter-icon-wrapper'
                      />
                    </div>
                  </span>
                );
              })}
              {filters?.sizes?.map((size) => (
                <span
                  key={size}
                  className='filter-chip-item filter-chip-base'
                >
                  {size}
                  <div onClick={() => handleCheckboxChange?.('sizes', size)}>
                    <Icon
                      name={'close'}
                      stroke={'#111111'}
                      className='filter-icon-wrapper'
                    />
                  </div>
                </span>
              ))}
              {((filters?.priceRange?.[0] && filters?.priceRange?.[0] > 100) ||
                (filters?.priceRange?.[1] &&
                  filters?.priceRange?.[1] < 49999)) && (
                  <span className='filter-chip-price'>
                    ₹{filters?.priceRange?.[0]} - ₹{filters?.priceRange?.[1]}
                    <div
                      onClick={() => {
                        handleFilterChange?.('priceRange', [100, 49999]);
                      }}
                    >
                      <Icon
                        name={'close'}
                        stroke={'#111111'}
                        className='filter-icon-wrapper'
                      />
                    </div>
                  </span>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Category Accordion */}
      {categoriesArray.length > 0 ? (
        <div className='filter-section-item filter-category-section'>
          <div
            className='filter-accordion-header mb-1'
            onClick={() => toggleAccordion('category')}
          >
            <h4
              className='filter-title case-class'
              style={{ color: themeContext?.bodyTextColor }}
            >
              Category <span>({categoriesArray.length})</span>
            </h4>
            <span
              className={`filter-accordion-toggle ${themeId === 3 ? 'filter-accordion-toggle-theme3' : ''
                }`}
              style={{ fontSize: '1.5rem', color: textColor }}
            >
              {openAccordion.category ? '−' : '+'}
            </span>
          </div>
          {/* Category Search Input */}
          {openAccordion.category && (
            <div className='filter-search-wrapper'>
              <CustomInput
                type='text'
                placeholder='Search categories...'
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                size='sm'
                leftIcon={() => (
                  <Icon
                    name='search'
                    strokeWidth='1.625'
                    stroke='currentColor'
                    className='filter-icon-small'
                  />
                )}
                style={{
                  backgroundColor: themeContext?.backgroundColor,
                  color: textColor,
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div
            className={`filter-accordion-content-wrapper scroll-bar ${openAccordion.category ? 'open' : 'closed'
              }`}
          >
            <div className='filter-accordion-inner'>
              {filteredCategories?.length > 0 ? (
                filteredCategories?.map((category) => {
                  const name = category?.sub_category_name || 'Unnamed';
                  const isChecked =
                    filters.categories?.includes(
                      category.sub_category_name.toLowerCase()
                    ) || false;
                  return (
                    <label
                      key={category.sub_category_id || name}
                      className='filter-label-base'
                    >
                      <input
                        type='checkbox'
                        className={`filter-checkbox-base filter-checkbox ${isChecked ? 'filter-checkbox-checked' : ''
                          } ${themeId === 3 || themeId === 4 || themeId === 5
                            ? 'filter-checkbox-theme345'
                            : ''
                          }`}
                        checked={isChecked}
                        onChange={() =>
                          handleCheckboxChange(
                            'categories',
                            category.sub_category_id.toString()
                          )
                        }
                      />
                      <span
                        className={`filter-label-text filter-label ${isChecked ? 'filter-label-checked' : ''
                          } ${themeId === 3 || themeId === 4 || themeId === 5
                            ? 'filter-label-theme345'
                            : ''
                          }`}
                        style={{
                          color: textColor,
                        }}
                      >
                        {name}
                      </span>
                    </label>
                  );
                })
              ) : (
                <p className='filter-no-results-text filter-no-results'>
                  No categories found
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className='filter-no-results-text filter-no-results'>
          No categories found
        </p>
      )}

      {/* Size Accordion */}
      {productVariationsArray.length > 0 && (
        <div className='filter-section-item scroll-bar filter-size-section'>
          <div
            className='filter-accordion-header mb-1'
            onClick={() => toggleAccordion('size')}
          >
            <h4
              className='filter-title case-class'
              style={{ color: themeContext?.bodyTextColor }}
            >
              Size <span>({productVariationsArray.length})</span>
            </h4>
            <span
              className={`filter-accordion-toggle ${themeId === 3 ? 'filter-accordion-toggle-theme3' : ''
                }`}
              style={{ fontSize: '1.5rem', color: textColor }}
            >
              {openAccordion.size ? '−' : '+'}
            </span>
          </div>

          {openAccordion.size && (
            <div className='filter-search-wrapper'>
              <CustomInput
                type='text'
                placeholder='Search sizes...'
                value={sizeSearch}
                onChange={(e) => setSizeSearch(e.target.value)}
                size='sm'
                leftIcon={() => (
                  <Icon
                    name='search'
                    strokeWidth='1.625'
                    stroke='currentColor'
                    className='filter-icon-small'
                  />
                )}
                style={{
                  backgroundColor: themeContext?.backgroundColor,
                  color: textColor,
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div
            className={`filter-accordion-content-wrapper scroll-bar ${openAccordion.size ? 'open' : 'closed'
              }`}
          >
            <div className='filter-accordion-inner-row'>
              {filteredSizes?.length > 0 ? (
                filteredSizes?.map((size) => {
                  const isChecked = filters.sizes?.includes(size) || false;
                  return (
                    <label
                      key={size}
                      className='filter-label-base'
                    >
                      <input
                        type='checkbox'
                        className={`filter-checkbox-base filter-checkbox ${isChecked ? 'filter-checkbox-checked' : ''
                          } ${themeId === 3 || themeId === 4 || themeId === 5
                            ? 'filter-checkbox-theme345'
                            : ''
                          }`}
                        checked={isChecked}
                        onChange={() => handleCheckboxChange?.('sizes', size)}
                      />
                      <span
                        className={`filter-label-text-uppercase filter-label ${isChecked ? 'filter-label-checked' : ''
                          } ${themeId === 3 || themeId === 4 || themeId === 5
                            ? 'filter-label-theme345'
                            : ''
                          }`}
                        style={{
                          color: textColor,
                        }}
                      >
                        {size}
                      </span>
                    </label>
                  );
                })
              ) : (
                <p className='filter-no-results-text filter-no-results'>
                  No sizes found
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Price Filter */}
      <div className='filter-price-section-base filter-price-section'>
        <h4
          className='filter-price-title case-class'
          style={{ color: themeContext?.bodyTextColor }}
        >
          Price
        </h4>
        <PriceFilterSlider
          value={filters.priceRange}
          onChange={(newRange) => {
            // Apply the price filter to trigger product reload
            // Note: Don't update local state here - let the hook handle it to avoid infinite loop
            handleFilterChange?.('priceRange', newRange);
          }}
        />
      </div>
    </div>
  );
}
