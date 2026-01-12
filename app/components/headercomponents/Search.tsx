'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Icon from '../customcomponents/Icon';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppSelector } from '../../redux/hooks';
import { RootState } from '../../redux/store';

function Search() {
  // Hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const themeContext = useTheme() || {};
  const { headerTextColor } = themeContext;

  // States
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedTerms, setSuggestedTerms] = useState<string[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Get data from Redux store
  const themeId = useAppSelector(
    (state: RootState) => state.storeInfo?.themeId
  );
  const productCategories = useAppSelector(
    (state: RootState) => state.products.productCategories
  );

  // Get categories from API and map to include name property for compatibility
  const categories = useMemo(
    () => productCategories?.sub_categories || [],
    [productCategories?.sub_categories]
  );

  // Search loading state (to be connected to actual search API when available)
  const searchLoading = false;

  const categoryNames = useMemo(() => {
    if (!Array.isArray(categories)) {
      return [];
    }

    return categories
      .map((category) => {
        if (typeof category === 'string') {
          return category;
        }

        if (category?.sub_category_name) {
          return category.sub_category_name;
        }

        return null;
      })
      .filter(Boolean) as string[];
  }, [categories]);

  const selectedCategory = useMemo(() => {
    const categoryParam = searchParams.get('categories');

    if (!categoryParam || !Array.isArray(categories)) {
      return null;
    }

    const categoryName = decodeURIComponent(categoryParam);
    return (
      categories.find(
        (cat) =>
          cat?.sub_category_name?.toLowerCase() === categoryName.toLowerCase()
      ) || null
    );
  }, [searchParams, categories]);

  useEffect(() => {
    const searchQueryParam = searchParams.get('search');

    if (searchQueryParam) {
      setSearchQuery(searchQueryParam);
    } else {
      setSearchQuery('');
    }
  }, [searchParams]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen && categoryNames.length > 0) {
      const shuffled = [...categoryNames].sort(() => Math.random() - 0.5);
      setSuggestedTerms(shuffled.slice(0, 8));
    } else if (
      !isSearchOpen &&
      categoryNames.length > 0 &&
      suggestedTerms.length === 0
    ) {
      setSuggestedTerms(categoryNames.slice(0, 8));
    }
  }, [isSearchOpen, categoryNames, suggestedTerms.length]);

  useEffect(() => {
    if (isCategoryOpen && categoryNames.length > 0) {
      const shuffled = [...categoryNames].sort(() => Math.random() - 0.5);
      setSuggestedTerms(shuffled.slice(0, 8));
    }
  }, [isCategoryOpen, categoryNames]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSearchOpen &&
        !(event.target as Element).closest('.search-dropdown') &&
        !(event.target as Element).closest('button[aria-label="Search"]')
      ) {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };

    if (isSearchOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isCategoryOpen &&
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
        setShowAllCategories(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isCategoryOpen) {
        setIsCategoryOpen(false);
        setShowAllCategories(false);
      }
    };

    if (isCategoryOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCategoryOpen]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      // Preserve existing filters and add search query
      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.set('search', trimmedQuery);
      currentParams.set('page', '1');

      // If no sort_by exists, set default
      if (!currentParams.has('sort_by')) {
        currentParams.set('sort_by', 'recently_added');
      }

      router.push(`/shop?${currentParams.toString()}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSearchClick = () => {
    setIsSearchOpen(true);
    setSearchQuery('');
  };

  const handleCloseSearch = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsSearchOpen(false);
      setIsClosing(false);
      setSearchQuery('');
    }, 400);
  };

  const handleSearchIconClick = () => {
    setIsSearchOpen(true);
    setSearchQuery('');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const themeLayout: Record<number, React.ReactNode> = {
    1: (
      <div className='relative'>
        <button
          onClick={handleSearchClick}
          className='h-full flex items-center cursor-pointer'
          aria-label='Search'
          type='button'
        >
          <Icon
            name='search'
            strokeWidth='1.625'
            viewBox='0 0 26 26'
            className='w-6 h-6 md:w-[1.625rem] md:h-[1.625rem]'
          />
        </button>

        {isSearchOpen && (
          <>
            <div
              className={`fixed top-full left-1/2  rounded-xl w-full max-w-[19.375rem] sm:max-w-[37.5rem] bg-white shadow-2xl z-50 search-dropdown ${
                isClosing ? 'search-dropdown-closing' : ''
              }`}
              style={{
                backgroundColor:
                  themeContext?.headerBackgroundColor || '#ffffff',
                color: headerTextColor || '#ffffff',
              }}
            >
              <form onSubmit={handleSearch}>
                <div className='flex items-center px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100'>
                  <div className='flex-1 relative flex items-center'>
                    <Icon
                      name='search'
                      strokeWidth='1.625'
                      stroke='currentColor'
                      className='w-5 h-5 sm:w-6 sm:h-6 text-gray-400 mr-3'
                    />
                    <input
                      ref={searchInputRef}
                      type='search'
                      autoComplete='off'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearch(e);
                        }
                      }}
                      placeholder='Search for products...'
                      className='w-full py-2 sm:py-3 text-base sm:text-lg border-none focus:outline-none bg-transparent text-[#111111]'
                      style={{
                        color: headerTextColor || '#111111',
                      }}
                    />
                  </div>
                  <button
                    onClick={handleCloseSearch}
                    type='button'
                    className='ml-3 p-1 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer'
                    aria-label='Close search'
                  >
                    <Icon
                      name='close'
                      size={20}
                      className='w-5 h-5'
                      strokeWidth='1.5'
                    />
                  </button>
                </div>

                <div className='px-4 py-4 sm:px-6 sm:py-6'>
                  <h3
                    className='text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider'
                    style={{
                      color: headerTextColor || '#111111',
                    }}
                  >
                    Suggested Search Terms
                  </h3>
                  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4  gap-2 sm:gap-3'>
                    {suggestedTerms.length > 0 &&
                      suggestedTerms.map((suggestion) => (
                        <button
                          key={suggestion}
                          type='button'
                          onClick={() => {
                            router.push(
                              `/shop?page=1&categories=${encodeURIComponent(
                                suggestion.toLowerCase()
                              )}&sort_by=recently_added`
                            );
                            handleCloseSearch();
                          }}
                          className='cursor-pointer text-left text-sm text-gray-600 hover:text-gray-900 rounded transition-colors duration-200'
                          style={{
                            color: headerTextColor || '#111111',
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                  </div>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    ),
    2: (
      <div className='relative max-w-[31.25rem] w-full'>
        {/* Mobile: Search Icon */}
        <button
          onClick={handleSearchIconClick}
          className='h-full flex items-center cursor-pointer md:hidden'
          aria-label='Search'
          type='button'
        >
          <Icon
            name='search'
            strokeWidth='1.625'
            viewBox='0 0 26 26'
            className='w-6 h-6'
          />
        </button>

        {/* Desktop: Inline Search Bar */}
        <div
          className='hidden md:flex items-center  rounded-[100px] px-3 py-2 w-full max-w-[31.25rem] border'
          style={{
            backgroundColor: themeContext?.headerBackgroundColor || '#ffffff',
            borderColor: `${headerTextColor || '#101010'}29`,
          }}
        >
          {/* Category Dropdown */}
          <div
            className='relative'
            ref={categoryRef}
          >
            <button
              type='button'
              onClick={() => {
                setIsCategoryOpen(!isCategoryOpen);
                if (isCategoryOpen) {
                  setShowAllCategories(false);
                }
              }}
              className='flex items-center justify-between text-sm font-medium text-[#101010] pr-2 border-r border-[#101010]/15 py-1 cursor-pointer '
              style={{
                color: headerTextColor,
                borderColor: `${headerTextColor}A1`,
              }}
            >
              <span className='truncate'>
                {selectedCategory?.sub_category_name || 'All Categories'}
              </span>

              <Icon
                name='chevronDown'
                stroke={headerTextColor || '#101010'}
                strokeWidth='1.5'
                className={`w-4 h-4 ml-1 transition-transform ${
                  isCategoryOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isCategoryOpen && (
              <div
                className='absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[140px] flex flex-col overflow-hidden'
                onMouseLeave={() => {
                  setIsCategoryOpen(false);
                  setShowAllCategories(false);
                }}
              >
                <div
                  className='max-h-[370px] overflow-y-auto scroll-bar'
                  style={{
                    backgroundColor:
                      themeContext?.headerBackgroundColor || '#ffffff',
                    color: headerTextColor,
                    // borderColor: `${headerTextColor}A1`,
                  }}
                >
                  {categories &&
                    categories.length > 0 &&
                    (showAllCategories
                      ? categories
                      : categories.slice(0, 10)
                    ).map((suggestion) => (
                      <button
                        key={suggestion?.sub_category_id}
                        type='button'
                        onClick={() => {
                          router.push(
                            `/shop?page=1&categories=${encodeURIComponent(
                              suggestion?.sub_category_name.toLowerCase()
                            )}&sort_by=recently_added`
                          );
                          setIsCategoryOpen(false);
                          setShowAllCategories(false);
                        }}
                        className='block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors cursor-pointer'
                      >
                        {suggestion?.sub_category_name}
                      </button>
                    ))}
                </div>
                {categories && categories.length > 10 && (
                  <button
                    type='button'
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className='font-bold cursor-pointer block w-full px-4 py-2 text-sm text-blue-500 hover:bg-gray-100 transition-colors duration-200 border-t border-gray-200'
                    style={{
                      color: headerTextColor || '#111111',
                      backgroundColor:
                        themeContext?.headerBackgroundColor || '#ffffff',
                    }}
                  >
                    {showAllCategories ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Search Input with Icon */}
          <div className='flex-1 flex items-center ms-3'>
            <input
              ref={searchInputRef}
              type='search'
              autoComplete='off'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch(e);
                }
              }}
              placeholder='What you are looking for?'
              className='text-base border-none focus:outline-none bg-transparent text-[${headerTextColor}] placeholder:text-[${headerTextColor}] appearance-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [-moz-appearance:none] pr-5'
            />
            <button
              type='button'
              onClick={searchQuery.trim() ? handleClearSearch : handleSearch}
              disabled={searchLoading || !searchQuery.trim()}
              className='p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ml-[-10px]'
            >
              <Icon
                name={
                  searchLoading
                    ? 'searchLoading'
                    : searchQuery.trim()
                    ? 'close'
                    : 'search'
                }
                strokeWidth={searchLoading ? '0.2' : '1.625'}
                stroke={headerTextColor || '#101010'}
                className={`w-5 h-5 ${searchLoading ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Search */}
        {isSearchOpen && (
          <div
            className={`fixed top-full left-1/2  rounded-xl w-full max-w-[20.375rem] sm:max-w-[37.5rem] bg-white shadow-2xl z-50 search-dropdown  md:max-w-[37.5rem] search-dropdown md:hidden ${
              isClosing ? 'search-dropdown-closing' : ''
            }`}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
            >
              <div
                className='flex items-center bg-[var(--bg-color-gray-100)] rounded-lg shadow-sm border border-gray-200 px-3 py-2 w-full max-w-full'
                style={{
                  backgroundColor:
                    themeContext?.headerBackgroundColor || '#ffffff',
                }}
              >
                {/* Search Input with Icon */}
                <div className='flex-1 flex items-center ms-3 relative'>
                  <input
                    ref={searchInputRef}
                    type='search'
                    value={String(searchQuery)}
                    disabled={searchLoading}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder='What you are looking for?'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearch(e);
                      }
                    }}
                    style={{
                      color: headerTextColor || '#101010',
                    }}
                    className='flex-1 py-1 text-base border-none focus:outline-none bg-transparent appearance-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [-moz-appearance:none] pr-6 sm:pr-10 '
                  />
                  <button
                    type='button'
                    onClick={handleSearch}
                    disabled={searchLoading || !searchQuery.trim()}
                    className='p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed absolute right-0 top-1/2 -translate-y-1/2'
                  >
                    <Icon
                      name={searchLoading ? 'searchLoading' : 'search'}
                      strokeWidth={searchLoading ? '0.2' : '1.625'}
                      stroke={headerTextColor || '#101010'}
                      className={`w-5 h-5 ${
                        searchLoading ? 'animate-spin' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    ),
    3: (
      <div className='relative max-w-[37.5rem] w-full'>
        {/* Mobile: Search Icon */}
        <button
          onClick={handleSearchIconClick}
          className='h-full flex items-center cursor-pointer md:hidden'
          aria-label='Search'
          type='button'
        >
          <Icon
            name='search'
            strokeWidth='1.625'
            viewBox='0 0 26 26'
            className='w-6 h-6'
          />
        </button>

        {/* Desktop: Inline Search Bar */}
        <div
          className='hidden md:flex items-center border border-[#101010]/15 rounded-[100px] px-3 py-2 w-full max-w-full'
          style={{
            borderColor: `${headerTextColor}29`,
          }}
        >
          {/* Search Input with Icon */}
          <div className='flex-1 flex items-center'>
            <input
              ref={searchInputRef}
              type='search'
              autoComplete='off'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch(e);
                }
              }}
              placeholder='Search Here'
              className='flex-1 py-1 text-base border-none focus:outline-none bg-transparent'
              style={{
                color: headerTextColor || '#101010',
              }}
            />
            <button
              type='button'
              onClick={handleSearch}
              disabled={searchLoading || !searchQuery.trim()}
              className='p-1 border-l ps-4 border-[#101010]/15  text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ml-2'
            >
              <Icon
                name={searchLoading ? 'searchLoading' : 'search'}
                strokeWidth={searchLoading ? '0.2' : '1.625'}
                stroke={headerTextColor || '#101010'}
                className={`w-5 h-5 ${searchLoading ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Search */}
        {isSearchOpen && (
          <div
            className={`fixed top-full left-1/2  rounded-xl w-full max-w-[20.375rem] sm:max-w-[37.5rem] bg-white shadow-2xl z-50 search-dropdown  md:max-w-[37.5rem] search-dropdown md:hidden ${
              isClosing ? 'search-dropdown-closing' : ''
            }`}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
            >
              <div
                className='flex items-center bg-[var(--bg-color-gray-100)] rounded-lg shadow-sm border border-gray-200 px-3 py-2 w-full max-w-full'
                style={{
                  backgroundColor:
                    themeContext?.headerBackgroundColor || '#ffffff',
                }}
              >
                {/* Search Input with Icon */}
                <div className='flex-1 flex items-center ms-3 relative'>
                  <input
                    ref={searchInputRef}
                    type='search'
                    value={String(searchQuery)}
                    disabled={searchLoading}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearch(e);
                      }
                    }}
                    placeholder='Search Here'
                    style={{
                      color: headerTextColor || '#101010',
                    }}
                    className='flex-1 py-1 text-base border-none focus:outline-none bg-transparent appearance-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [-moz-appearance:none] pr-1 sm:pr-10'
                  />
                  <button
                    type='button'
                    onClick={handleSearch}
                    disabled={searchLoading || !searchQuery.trim()}
                    className='p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed absolute right-0 top-1/2 -translate-y-1/2'
                  >
                    <Icon
                      name={searchLoading ? 'searchLoading' : 'search'}
                      strokeWidth={searchLoading ? '0.2' : '1.625'}
                      stroke={headerTextColor || '#101010'}
                      className={`w-5 h-5 ${
                        searchLoading ? 'animate-spin' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    ),
    4: (
      <>
        <div className='relative'>
          <button
            onClick={handleSearchClick}
            className='h-full flex items-center cursor-pointer hover:opacity-70 transition-opacity'
            aria-label='Search'
            type='button'
          >
            <Icon
              name='search'
              strokeWidth='1.5'
              size={23}
            />
          </button>
        </div>

        {/* Full Width Search Bar - appears below navItems */}
        {isSearchOpen && (
          <div
            className='absolute w-full left-[50%] top-[5rem] z-50 bg-white border-b border-gray-200 shadow-sm search-dropdown'
            style={{
              backgroundColor: themeContext?.headerBackgroundColor || '#ffffff',
              color: headerTextColor || '#ffffff',
            }}
          >
            <div className='mx-auto p-4'>
              <form
                onSubmit={handleSearch}
                className='w-full'
              >
                <div
                  className='flex items-center gap-2 px-4 py-3 w-full rounded-lg border'
                  style={{
                    backgroundColor:
                      themeContext?.headerBackgroundColor || '#ffffff',
                    color: headerTextColor || '#ffffff',
                    borderColor: headerTextColor || '#e0e0e0',
                  }}
                >
                  <Icon
                    name='search'
                    size={20}
                    className='w-5 h-5'
                    stroke={headerTextColor || '#101010'}
                    strokeWidth='1.5'
                  />
                  <input
                    ref={searchInputRef}
                    type='text'
                    placeholder='Search products...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearch(e);
                      }
                    }}
                    className='flex-1 bg-transparent outline-none w-full text-base'
                    style={{ color: headerTextColor || '#101010' }}
                  />
                  <button
                    onClick={handleCloseSearch}
                    type='button'
                    className='ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer'
                    aria-label='Close search'
                  >
                    <Icon
                      name='close'
                      size={18}
                      className='w-4 h-4'
                      strokeWidth='1.5'
                    />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    ),
    5: (
      <>
        <div className='relative'>
          <button
            onClick={handleSearchClick}
            className='h-full flex items-center cursor-pointer hover:opacity-70 transition-opacity'
            aria-label='Search'
            type='button'
          >
            <Icon
              name='search'
              strokeWidth='1.5'
              size={23}
            />
          </button>
        </div>

        {/* Full Width Search Bar - appears below navItems */}
        {isSearchOpen && (
          <div
            className='absolute w-full left-[50%] top-[5rem] z-50 bg-white border-b border-gray-200 shadow-sm search-dropdown'
            style={{
              backgroundColor: themeContext?.headerBackgroundColor || '#ffffff',
              color: headerTextColor || '#ffffff',
            }}
          >
            <div className='mx-auto p-4'>
              <form
                onSubmit={handleSearch}
                className='w-full'
              >
                <div
                  className='flex items-center gap-2 px-4 py-3 w-full border'
                  style={{
                    backgroundColor:
                      themeContext?.headerBackgroundColor || '#ffffff',
                    color: headerTextColor || '#ffffff',
                    borderColor: headerTextColor || '#e0e0e0',
                  }}
                >
                  <Icon
                    name='search'
                    size={20}
                    className='w-5 h-5'
                    stroke={headerTextColor || '#101010'}
                    strokeWidth='1.5'
                  />
                  <input
                    ref={searchInputRef}
                    type='text'
                    placeholder='Search products...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearch(e);
                      }
                    }}
                    className='flex-1 bg-transparent outline-none w-full text-base'
                    style={{ color: headerTextColor || '#101010' }}
                  />
                  <button
                    onClick={handleCloseSearch}
                    type='button'
                    className='ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer'
                    aria-label='Close search'
                  >
                    <Icon
                      name='close'
                      size={18}
                      className='w-4 h-4'
                      strokeWidth='1.5'
                    />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    ),
    6: (
      <>
        {isSearchOpen && (
          <div className='fixed inset-0 z-[60] flex items-start justify-center pt-20 p-4'>
            <div
              className='absolute inset-0 bg-black/40 backdrop-blur-sm'
              onClick={() => setIsSearchOpen(false)}
            />

            <div className='relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden'>
              <div className='p-6'>
                <form
                  onSubmit={handleSearch}
                  className='flex items-center gap-4'
                >
                  <Icon
                    name='search'
                    size={24}
                    className='text-theme2-accent flex-shrink-0'
                  />
                  <input
                    type='text'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder='Search products...'
                    autoFocus
                    className='flex-1 py-2 text-xl bg-transparent outline-none text-theme2-text placeholder:text-theme2-textMuted'
                  />
                  <button
                    type='button'
                    onClick={() => setIsSearchOpen(false)}
                    className='p-2 rounded-xl hover:bg-theme2-background text-theme2-textMuted'
                  >
                    <Icon
                      name='close'
                      size={24}
                    />
                  </button>
                </form>
              </div>

              <div className='px-6 pb-6'>
                <div className='flex flex-wrap gap-2'>
                  {['Jackets', 'Watches', 'Sneakers', 'Bags'].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        router.push(`/shop?search=${item}`);
                        setIsSearchOpen(false);
                      }}
                      className='px-4 py-2 text-sm bg-theme2-background text-theme2-text rounded-full hover:bg-theme2-accent hover:text-white transition-colors'
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleSearchClick}
          className='h-full flex items-center cursor-pointer'
          aria-label='Search'
          type='button'
        >
          <Icon
            name='search'
            strokeWidth='1.5'
            size={23}
          />
        </button>
      </>
    ),
  };

  return <>{themeLayout[themeId] || themeLayout[1]}</>;
}

export default Search;
