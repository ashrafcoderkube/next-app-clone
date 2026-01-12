'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppSelector } from '../../redux/hooks';
import { RootState } from '../../redux/store';
import Icon from '../customcomponents/Icon';
import SafeImage from '../SafeImage';

export default function Footer() {
  const themeContext = useTheme() || {};
  const { footerTextColor, bottomFooterTextColor } = themeContext;
  const { storeInfo, themeId } = useAppSelector(
    (state: RootState) => state.storeInfo
  );

  // Get storeInfo data - handle both structures
  const storeInfoData =
    storeInfo?.data?.storeinfo || (storeInfo as any)?.storeinfo || null;

  // ═══════════════════════════════════════════════════════════════
  // DYNAMIC FOOTER CONTENT - Edit links here without changing layouts
  // ═══════════════════════════════════════════════════════════════
  const footerContent = {
    // Brand description
    brandDescription: `At ${
      storeInfoData?.store_name || 'Store name'
    }, we bring you hand-picked products from trusted brands around the world. Our mission is to make online shopping simple, secure, and enjoyable — with styles and deals you'll love.`,

    // Support Links
    supportLinks: [
      { label: 'FAQ', url: '/faq' },
      { label: 'Terms & Conditions', url: '/terms-of-use' },
      { label: 'Privacy Policy', url: '/privacy-policy' },
    ],

    // Company Links
    companyLinks: [
      { label: 'About Us', url: '/about' },
      { label: 'Contact Us', url: '/contact' },
      { label: 'Support', url: '/support' },
    ],

    // Use Links (combined for layout 2)
    useLinks: [
      { label: 'About Us', url: '/about' },
      { label: 'Contact Us', url: '/contact' },
      { label: 'Support', url: '/support' },
      { label: 'FAQ', url: '/faq' },
      { label: 'Terms & Conditions', url: '/terms-of-use' },
      { label: 'Privacy Policy', url: '/privacy-policy' },
    ],

    // Navigation Links (for layout 3 - horizontal)
    navLinks: [
      { label: 'About Us', url: '/about' },
      { label: 'Contact Us', url: '/contact' },
      { label: 'Support', url: '/support' },
      { label: 'FAQ', url: '/faq' },
      { label: 'Terms & Conditions', url: '/terms-of-use' },
      { label: 'Privacy Policy', url: '/privacy-policy' },
    ],

    // Shop Links (for layout 4)
    shopLinks: [
      { label: 'All Products', url: '/shop?page=1&sort_by=recently_added' },
      { label: 'Categories', url: '/categories' },
      { label: 'New Arrivals', url: '/shop?page=1&sort_by=recently_added' },
      { label: 'Best Sellers', url: '/shop?page=1&sort_by=recently_added' },
    ],

    // Full Company Links (for layout 4)
    fullCompanyLinks: [
      { label: 'About Us', url: '/about' },
      { label: 'Contact Us', url: '/contact' },
      { label: 'Support', url: '/support' },
      { label: 'FAQ', url: '/faq' },
      { label: 'Terms & Conditions', url: '/terms-of-use' },
      { label: 'Privacy Policy', url: '/privacy-policy' },
    ],

    // Social Media
    socialMedia: [
      {
        name: 'facebook',
        label: 'Facebook',
        url: storeInfoData?.facebook_url,
        icon: 'facebook',
      },
      {
        name: 'instagram',
        label: 'Instagram',
        url: storeInfoData?.instagram_url,
        icon: 'instagram',
      },
      {
        name: 'twitter',
        label: 'X Corp.',
        url: storeInfoData?.twitter_url,
        icon: 'twitter',
      },
    ],

    // Working days
    workingDays: 'Monday - Saturday',
  };

  // Helper to render link list
  const renderLinks = (
    links: Array<{ label: string; url: string }>,
    className: string = ''
  ) =>
    links.map((link) => (
      <li
        key={link.label}
        className='mb-1'
      >
        <Link
          href={link.url}
          prefetch={false}
          className={`hover:brightness-80 transition-all duration-600 ease-in-out ${className}`}
        >
          {link.label}
        </Link>
      </li>
    ));

  // Helper to render social icons with labels
  const renderSocialWithLabels = (className: string = '') =>
    footerContent.socialMedia
      .filter((social) => social.url)
      .map((social) => (
        <li
          key={social.name}
          className='mb-1'
        >
          <Link
            href={social.url || '#'}
            prefetch={false}
            target='_blank'
            rel='noopener noreferrer'
            className={`flex align-center gap-2 hover:brightness-80 transition-all duration-600 ease-in-out ${className}`}
          >
            <Icon
              name={social.icon}
              size={social.icon === 'twitter' ? 24 : undefined}
              fill={
                social.icon === 'twitter'
                  ? footerTextColor
                  : footerTextColor || '#ffffff'
              }
              stroke={
                social.icon === 'twitter'
                  ? footerTextColor || '#ffffff'
                  : undefined
              }
              strokeWidth='0.2'
            />
            <span>{social.label}</span>
          </Link>
        </li>
      ));

  // Helper to render social icons only (no labels)
  const renderSocialIconsOnly = () =>
    footerContent.socialMedia
      .filter((social) => social.url)
      .map((social) => (
        <li key={social.name}>
          <Link
            href={social.url || '#'}
            prefetch={false}
            target='_blank'
            rel='noopener noreferrer'
            className='flex align-center gap-2 hover:brightness-80 transition-all duration-600 ease-in-out'
          >
            <Icon
              name={social.icon}
              size={social.icon === 'twitter' ? 24 : undefined}
              className='w-5 h-5'
              fill={
                social.icon === 'twitter'
                  ? footerTextColor
                  : footerTextColor || '#ffffff'
              }
              stroke={
                social.icon === 'twitter'
                  ? footerTextColor || '#ffffff'
                  : undefined
              }
              strokeWidth='0.2'
            />
          </Link>
        </li>
      ));

  const themeLayout: Record<number, React.ReactNode> = {
    1: (
      <footer
        className='!pt-[0px] py-[30px] lg:py-[70px]'
        style={{
          backgroundColor: themeContext?.footerBackgroundColor || '#1f2937',
          color: footerTextColor || '#ffffff',
        }}
      >
        <div className='px-container pt-[3rem] sm:pt-[4.375rem]'>
          <div className='flex flex-col xl:flex-row pb-[1.875rem] lg:pb-[4.6875rem] gap-4 footer-flex'>
            <Link
              href='/'
              className='lg:text-left w-full xl:max-w-[15.75rem] text-center mb-3 mb-lg-0'
            >
              {storeInfoData?.logo?.trim() ? (
                <SafeImage
                  src={storeInfoData.logo}
                  alt={storeInfoData?.store_name || 'Store logo'}
                  width={120}
                  height={60}
                  className='!sm:h-[3.5rem] !h-12 transition-all duration-300 ease-out text-center mx-auto lg:text-left lg:mx-0 object-contain !w-auto'
                />
              ) : (
                <h2
                  className='uppercase text-sm font-semibold text-[1.5rem]'
                  style={{ color: footerTextColor || '#101010' }}
                >
                  {storeInfoData?.store_name || 'Store name'}
                </h2>
              )}
            </Link>
            <div className='flex flex-wrap w-full gap-10 md:justify-between'>
              <div className='text-left customer-care w-full md:w-max flex-auto'>
                <h2 className='mb-4 font-bold text-lg'>Customer Care</h2>
                <ul className='font-regular flex flex-col gap-1'>
                  {storeInfoData?.email && (
                    <li className='mb-1'>
                      <Link
                        href={`mailto:${storeInfoData.email}`}
                        className='flex gap-2 hover:brightness-80 transition-all duration-600 ease-in-out'
                      >
                        <Icon
                          name='mail'
                          stroke={footerTextColor || '#ffffff'}
                          strokeWidth='2'
                          fill='none'
                        />
                        {storeInfoData.email}
                      </Link>
                    </li>
                  )}
                  {storeInfoData?.mobile_no &&
                    storeInfoData.mobile_no.length > 0 && (
                      <li className='mb-1'>
                        <Link
                          href={`tel:${storeInfoData.mobile_no}`}
                          className='flex gap-2 hover:brightness-80 transition-all duration-600 ease-in-out'
                        >
                          <Icon
                            name='call'
                            size={24}
                            stroke={footerTextColor || '#ffffff'}
                            strokeWidth='2'
                          />
                          {storeInfoData.mobile_no || '+91 9876543210'}
                        </Link>
                      </li>
                    )}
                </ul>
                <ul className='font-regular flex flex-col gap-1 mt-3'>
                  <li className='mb-1'>
                    <span>
                      {' '}
                      {storeInfoData?.store_time || '11:00 AM to 08:00 PM'}
                    </span>
                  </li>
                  <li className='mb-1'>
                    <span>{footerContent.workingDays}</span>
                  </li>
                </ul>
              </div>

              <div className='text-left w-full sm:w-max  flex-auto'>
                <h2 className='mb-4 font-bold text-lg'>Support</h2>
                <ul className='font-regular flex flex-col gap-1'>
                  {renderLinks(footerContent.supportLinks)}
                </ul>
              </div>

              <div className='text-left w-full sm:w-max flex-auto'>
                <h2 className='mb-4 font-bold text-lg'>Company</h2>
                <ul className='font-regular flex flex-col gap-1'>
                  {renderLinks(footerContent.companyLinks)}
                </ul>
              </div>

              {footerContent.socialMedia.filter((social) => social.url).length >
                0 && (
                <div className='text-left w-full sm:w-max flex-auto'>
                  <h2 className='mb-4 font-bold text-lg '>Social Media</h2>
                  <ul className='font-regular flex flex-col gap-4 social-login'>
                    {renderSocialWithLabels()}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className='border opacity-5'></div>
        </div>

        <div className='pt-[0.9375rem]'>
          <p>
            © {new Date().getFullYear()} {storeInfoData?.store_name}. All rights
            reserved.
          </p>
        </div>
      </footer>
    ),
    2: (
      <footer
        className='pt-[0px] lg:pt-[0px]'
        style={{
          backgroundColor: themeContext?.footerBackgroundColor || '#f8f8f8',
          color: footerTextColor || '#ffffff',
        }}
      >
        <div className='px-container pt-[3rem] sm:pt-[4.375rem]'>
          <div className='flex flex-col lg:flex-row pb-[1.875rem] lg:pb-[4.375rem] gap-[2rem] 2xl:gap-[3.125rem] footer-flex'>
            <div className='lg:text-left w-full lg:max-w-[31.875rem] text-center mb-3 mb-lg-0'>
              {storeInfoData?.logo?.trim() ? (
                <SafeImage
                  src={storeInfoData.logo}
                  alt={storeInfoData?.store_name || 'Store logo'}
                  width={120}
                  height={60}
                  className='!sm:h-[3.5rem] !h-12 transition-all duration-300 ease-out text-center mx-auto lg:text-left lg:mx-0 object-contain !w-auto'
                />
              ) : (
                <h2
                  className='text-sm font-semibold text-[1.5rem]'
                  style={{ color: footerTextColor || '#101010' }}
                >
                  {storeInfoData?.store_name || 'Store name'}
                </h2>
              )}
              <p className='mt-4 xl:mr-[3.75rem]'>
                {footerContent.brandDescription}
              </p>
            </div>
            <div className='flex  w-full gap-[2rem] 2xl:gap-[2.5rem] md:justify-between flex-wrap sm:flex-nowrap '>
              <div className='text-left customer-care w-full md:w-[18.6rem] flex-auto'>
                <h2 className='mb-4 font-bold text-lg'>Customer Care</h2>
                <ul className='font-regular flex flex-col gap-4'>
                  {storeInfoData?.email && (
                    <li className='mb-1'>
                      <Link
                        href={`mailto:${storeInfoData.email}`}
                        className='flex gap-2 hover:brightness-80 transition-all duration-600 ease-in-out font-medium'
                        prefetch={false}
                      >
                        <Icon
                          name='mail'
                          stroke={footerTextColor || '#ffffff'}
                          strokeWidth='2'
                          fill='none'
                        />
                        {storeInfoData.email}
                      </Link>
                    </li>
                  )}
                  {storeInfoData?.mobile_no &&
                    storeInfoData.mobile_no.length > 0 && (
                      <li className='mb-1'>
                        <Link
                          href={`tel:${storeInfoData.mobile_no}`}
                          className='flex gap-2 hover:brightness-80 transition-all duration-600 ease-in-out font-medium'
                        >
                          <Icon
                            name='call'
                            size={24}
                            stroke={footerTextColor || '#ffffff'}
                            strokeWidth='2'
                          />
                          {storeInfoData.mobile_no || '+91 9876543210'}
                        </Link>
                      </li>
                    )}
                </ul>
                <ul className='font-regular flex flex-col gap-1 mt-3 font-medium'>
                  <li className='mb-1'>
                    <span>
                      {' '}
                      {storeInfoData?.store_time || '11:00 AM to 08:00 PM'}
                    </span>
                  </li>
                  <li className='mb-1'>
                    <span>{footerContent.workingDays}</span>
                  </li>
                </ul>
              </div>

              <div className='text-left w-full md:w-[15.6rem] flex-auto'>
                <h2 className='mb-4 font-bold text-lg'>Use Link</h2>
                <ul className='font-regular flex flex-col gap-1'>
                  {renderLinks(footerContent.useLinks, 'font-medium')}
                </ul>
              </div>

              <div className='text-left w-full md:w-[15.6rem] flex-auto'>
                <h2 className='mb-4 font-bold text-lg '>Social Media</h2>
                <ul className='font-regular flex flex-col gap-4 social-login'>
                  {renderSocialWithLabels('font-medium')}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div
          className='py-[0.9375rem]'
          style={{
            backgroundColor: themeContext?.bottomFooterBackgroundColor,
            color: bottomFooterTextColor,
            height: 'fit-content',
          }}
        >
          <p>
            © {new Date().getFullYear()} {storeInfoData?.store_name}. All rights
            reserved.
          </p>
        </div>
      </footer>
    ),
    3: (
      <footer
        className='!pt-[0px] py-[30px] lg:py-[60px]'
        style={{
          backgroundColor: themeContext?.footerBackgroundColor || '#1f2937',
          color: footerTextColor || '#ffffff',
        }}
      >
        <div className='px-container pt-[3rem] sm:pt-[4.375rem]'>
          <div className='flex flex-col pb-[1.875rem] gap-4 footer-flex justify-center'>
            <Link
              href='/'
              className='w-max lg:mx-auto mb-3 mb-lg-0 text-center'
            >
              {storeInfoData?.logo?.trim() ? (
                <SafeImage
                  src={storeInfoData.logo}
                  alt={storeInfoData?.store_name || 'Store logo'}
                  width={120}
                  height={60}
                  className='!sm:h-[3.5rem] !h-12 transition-all duration-300 ease-out text-center mx-auto object-contain !w-auto'
                />
              ) : (
                <h2
                  className='uppercase text-sm font-semibold text-[1.5rem]'
                  style={{ color: footerTextColor || '#101010' }}
                >
                  {storeInfoData?.store_name || 'Store name'}
                </h2>
              )}
            </Link>
            <div className='space-y-4'>
              <ul className='font-regular flex flex-col lg:flex-row  flex-wrap gap-1 space-x-6 text-start lg:justify-center'>
                {renderLinks(footerContent.navLinks)}
              </ul>
              <ul className='font-regular flex flex-col lg:flex-row  flex-wrap gap-1 space-x-6 text-start lg:justify-center'>
                {storeInfoData?.email && (
                  <li className='mb-1'>
                    <Link
                      href={`mailto:${storeInfoData.email}`}
                      className='flex gap-2 hover:brightness-80 transition-all duration-600 ease-in-out'
                    >
                      <Icon
                        name='mail'
                        stroke={footerTextColor || '#ffffff'}
                        strokeWidth='2'
                        fill='none'
                      />
                      {storeInfoData.email}
                    </Link>
                  </li>
                )}
                {storeInfoData?.mobile_no &&
                  storeInfoData.mobile_no.length > 0 && (
                    <li className='mb-1'>
                      <Link
                        href={`tel:${storeInfoData.mobile_no}`}
                        className='flex gap-2 hover:brightness-80 transition-all duration-600 ease-in-out'
                      >
                        <Icon
                          name='call'
                          size={24}
                          stroke={footerTextColor || '#ffffff'}
                          strokeWidth='2'
                        />
                        {storeInfoData.mobile_no || '+91 9876543210'}
                      </Link>
                    </li>
                  )}
                <li className='mb-1'>
                  <span>
                    {' '}
                    {storeInfoData?.store_time || '11:00 AM to 08:00 PM'}
                  </span>
                </li>
                <li className='mb-1'>
                  <span>{footerContent.workingDays}</span>
                </li>
              </ul>
            </div>
          </div>
          <div className='border opacity-5'></div>
        </div>

        <div className='pt-[0.9375rem] px-container'>
          <div className='flex justify-between flex-wrap gap-3'>
            <p>
              © {new Date().getFullYear()} {storeInfoData?.store_name}. All
              rights reserved.
            </p>
            {footerContent.socialMedia.filter((social) => social.url).length >
              0 && (
              <ul className='font-regular flex gap-4 social-login'>
                {renderSocialIconsOnly()}
              </ul>
            )}
          </div>
        </div>
      </footer>
    ),
    4: (
      <footer
        className='pt-[0px] lg:pt-[0px]'
        style={{
          backgroundColor: themeContext?.footerBackgroundColor || '#f8f8f8',
          color: footerTextColor || '#ffffff',
        }}
      >
        <div className='px-container pt-[3rem] sm:pt-[4.375rem]'>
          <div className='flex flex-col lg:flex-row pb-[1.875rem] lg:pb-[4.375rem] gap-[2rem] 2xl:gap-[3.125rem] footer-flex'>
            <div className='lg:text-left w-full lg:max-w-[31.875rem] text-center mb-3 mb-lg-0'>
              {storeInfoData?.logo?.trim() ? (
                <SafeImage
                  src={storeInfoData.logo}
                  alt={storeInfoData?.store_name || 'Store logo'}
                  width={120}
                  height={60}
                  className='!sm:h-[3.5rem] !h-12 transition-all duration-300 ease-out text-center mx-auto lg:text-left lg:mx-0 object-contain !w-auto'
                />
              ) : (
                <h2
                  className='text-sm font-semibold text-[1.5rem]'
                  style={{ color: footerTextColor || '#101010' }}
                >
                  {storeInfoData?.store_name || 'Store name'}
                </h2>
              )}
              <p className='mt-4 xl:mr-[3.75rem]'>
                {footerContent.brandDescription}
              </p>
              {footerContent.socialMedia.filter((social) => social.url).length >
                0 && (
                <ul className='font-regular flex flex-row gap-4 social-login pt-5 justify-center lg:justify-start'>
                  {renderSocialIconsOnly()}
                </ul>
              )}
            </div>
            <div className='flex  w-full gap-[2rem] 2xl:gap-[2.5rem] md:justify-between flex-wrap sm:flex-nowrap '>
              <div className='text-left w-full md:w-[15.6rem] flex-auto'>
                <h2 className='mb-4 font-bold text-lg'>Shop</h2>
                <ul className='font-regular flex flex-col gap-1'>
                  {renderLinks(footerContent.shopLinks, 'font-medium')}
                </ul>
              </div>
              <div className='text-left customer-care w-full md:w-[18.6rem] flex-auto'>
                <h2 className='mb-4 font-bold text-lg'>Customer Care</h2>
                <ul className='font-regular flex flex-col gap-4'>
                  {storeInfoData?.email && (
                    <li className='mb-1'>
                      <Link
                        href={`mailto:${storeInfoData.email}`}
                        className='flex gap-2 hover:brightness-80 transition-all duration-600 ease-in-out font-medium'
                      >
                        <Icon
                          name='mail'
                          stroke={footerTextColor || '#ffffff'}
                          strokeWidth='2'
                          fill='none'
                        />
                        {storeInfoData.email}
                      </Link>
                    </li>
                  )}
                  {storeInfoData?.mobile_no &&
                    storeInfoData.mobile_no.length > 0 && (
                      <li className='mb-1'>
                        <Link
                          href={`tel:${storeInfoData.mobile_no}`}
                          className='flex gap-2 hover:brightness-80 transition-all duration-600 ease-in-out font-medium'
                        >
                          <Icon
                            name='call'
                            size={24}
                            stroke={footerTextColor || '#ffffff'}
                            strokeWidth='2'
                          />
                          {storeInfoData.mobile_no || '+91 9876543210'}
                        </Link>
                      </li>
                    )}
                </ul>
                <ul className='font-regular flex flex-col gap-1 mt-3 font-medium'>
                  <li className='mb-1'>
                    <span>
                      {' '}
                      {storeInfoData?.store_time || '11:00 AM to 08:00 PM'}
                    </span>
                  </li>
                  <li className='mb-1'>
                    <span>{footerContent.workingDays}</span>
                  </li>
                </ul>
              </div>

              <div className='text-left w-full md:w-[15.6rem] flex-auto'>
                <h2 className='mb-4 font-bold text-lg'>Company</h2>
                <ul className='font-regular flex flex-col gap-1'>
                  {renderLinks(footerContent.fullCompanyLinks, 'font-medium')}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div
          className='py-[0.9375rem]'
          style={{
            backgroundColor: themeContext?.bottomFooterBackgroundColor,
            color: bottomFooterTextColor,
            height: 'fit-content',
          }}
        >
          <p>
            © {new Date().getFullYear()} {storeInfoData?.store_name}. All rights
            reserved.
          </p>
        </div>
      </footer>
    ),
    6: (
      <footer
        className='bg-white'
        style={{
          backgroundColor: themeContext?.footerBackgroundColor || '#ffffff',
          color: footerTextColor || '#ffffff',
        }}
      >
        {/* Main Footer */}
        <div className='px-container'>
          <div className='py-16'>
            {/* Top Section - Logo and Links in Row */}
            <div className='flex flex-col lg:flex-row gap-12 lg:gap-20 mb-10 text-start'>
              {/* Brand Section */}
              <div className='lg:w-1/4'>
                <Link
                  href='/'
                  className='flex items-center gap-3 mb-6'
                >
                  {storeInfoData?.logo?.trim() ? (
                    <SafeImage
                      src={storeInfoData.logo}
                      alt={storeInfoData?.store_name || 'Store logo'}
                      width={120}
                      height={60}
                      className='!sm:h-[3.5rem] !h-12 transition-all duration-300 ease-out text-center mx-auto lg:text-left lg:mx-0 object-contain !w-auto'
                    />
                  ) : (
                    <h2
                      className='text-sm font-semibold text-[1.5rem]'
                      style={{ color: footerTextColor || '#101010' }}
                    >
                      {storeInfoData?.store_name || 'Store name'}
                    </h2>
                  )}
                </Link>
                <p className='text-sm max-w-xs'>
                  {footerContent.brandDescription}
                </p>
              </div>

              {/* Links Grid */}
              <div className='flex-1 grid sm:grid-cols-2 md:grid-cols-3 gap-4'>
                <div>
                  <h4 className='font-semibold text-theme1-text mb-4 text-sm uppercase'>
                    Company
                  </h4>
                  <ul className='font-regular flex flex-col gap-1 text-sm'>
                    {renderLinks(footerContent.companyLinks)}
                  </ul>
                </div>

                <div>
                  <h2 className='font-semibold text-theme1-text mb-4 text-sm uppercase'>
                    Support
                  </h2>
                  <ul className='font-regular flex flex-col gap-1 text-sm'>
                    {renderLinks(footerContent.supportLinks)}
                  </ul>
                </div>

                <div>
                  <h2 className='font-semibold text-theme1-text mb-4 text-sm uppercase'>
                    Customer Care
                  </h2>
                  <ul className='font-regular flex flex-col gap-1 text-sm'>
                    {storeInfoData?.email && (
                      <li className='mb-1'>
                        <Link
                          href={`mailto:${storeInfoData.email}`}
                          className='flex gap-2 hover:brightness-80 transition-all duration-600 ease-in-out'
                        >
                          <Icon
                            name='mail'
                            size={24}
                            stroke={footerTextColor || '#ffffff'}
                            strokeWidth='2'
                          />
                          {storeInfoData.email}
                        </Link>
                      </li>
                    )}
                    {storeInfoData?.mobile_no &&
                      storeInfoData.mobile_no.length > 0 && (
                        <li className='mb-1'>
                          <Link
                            href={`tel:${storeInfoData.mobile_no}`}
                            className='flex gap-2 hover:brightness-80 transition-all duration-600 ease-in-out'
                          >
                            <Icon
                              name='call'
                              size={24}
                              stroke={footerTextColor || '#ffffff'}
                              strokeWidth='2'
                            />
                            {storeInfoData.mobile_no || '+91 9876543210'}
                          </Link>
                        </li>
                      )}
                  </ul>
                  <ul className='font-regular flex flex-col gap-1 mt-3 text-sm'>
                    <li className='mb-1'>
                      <span>
                        {' '}
                        {storeInfoData?.store_time || '11:00 AM to 08:00 PM'}
                      </span>
                    </li>
                    <li className='mb-1'>
                      <span>{footerContent.workingDays}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div
              className='pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-6'
              style={{
                borderColor: themeContext?.buttonBackgroundColor || '#e0e0e0',
              }}
            >
              <div className='flex items-center gap-6'>
                <ul className='font-regular flex  gap-4 social-login'>
                  {renderSocialIconsOnly()}
                </ul>
              </div>

              <p>
                © {new Date().getFullYear()} {storeInfoData?.store_name}. All
                rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    ),
  };

  return <>{themeLayout[themeId || 1] || themeLayout[1]}</>;
}
