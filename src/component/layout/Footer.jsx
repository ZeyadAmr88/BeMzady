"use client";
import React from "react";

import { Link } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <footer
      className={`${
        darkMode
          ? "bg-gradient-to-b from-gray-900 to-gray-800 text-gray-200"
          : "bg-gradient-to-b from-gray-50 to-white text-gray-700"
      } pt-10 sm:pt-16 pb-8 sm:pb-12`}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* About */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-transparent">
              BeMazady
            </h3>
            <p className="mb-4 sm:mb-6 text-gray-500 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
              Your premier destination for online auctions. Find unique items,
              bid with confidence, and enjoy a secure trading experience.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a
                href="#"
                className="p-1.5 sm:p-2 rounded-full bg-gray-200/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-300"
              >
                <Facebook size={16} className="sm:w-5 sm:h-5" />
              </a>
              <a
                href="#"
                className="p-1.5 sm:p-2 rounded-full bg-gray-200/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-300"
              >
                <Twitter size={16} className="sm:w-5 sm:h-5" />
              </a>
              <a
                href="#"
                className="p-1.5 sm:p-2 rounded-full bg-gray-200/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-300"
              >
                <Instagram size={16} className="sm:w-5 sm:h-5" />
              </a>
              <a
                href="#"
                className="p-1.5 sm:p-2 rounded-full bg-gray-200/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-300"
              >
                <Youtube size={16} className="sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-6 text-gray-900 dark:text-gray-100">
              Quick Links
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 transition-colors duration-200 flex items-center group text-sm sm:text-base"
                >
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-rose-600 opacity-0 group-hover:opacity-100 mr-1.5 sm:mr-2 transition-opacity duration-200"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/auctions"
                  className="text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 transition-colors duration-200 flex items-center group text-sm sm:text-base"
                >
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-rose-600 opacity-0 group-hover:opacity-100 mr-1.5 sm:mr-2 transition-opacity duration-200"></span>
                  Auctions
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 transition-colors duration-200 flex items-center group text-sm sm:text-base"
                >
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-rose-600 opacity-0 group-hover:opacity-100 mr-1.5 sm:mr-2 transition-opacity duration-200"></span>
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 transition-colors duration-200 flex items-center group text-sm sm:text-base"
                >
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-rose-600 opacity-0 group-hover:opacity-100 mr-1.5 sm:mr-2 transition-opacity duration-200"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 transition-colors duration-200 flex items-center group text-sm sm:text-base"
                >
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-rose-600 opacity-0 group-hover:opacity-100 mr-1.5 sm:mr-2 transition-opacity duration-200"></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-6 text-gray-900 dark:text-gray-100">
              Help & Support
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link
                  to="/faq"
                  className="text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 transition-colors duration-200 flex items-center group text-sm sm:text-base"
                >
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-rose-600 opacity-0 group-hover:opacity-100 mr-1.5 sm:mr-2 transition-opacity duration-200"></span>
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 transition-colors duration-200 flex items-center group text-sm sm:text-base"
                >
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-rose-600 opacity-0 group-hover:opacity-100 mr-1.5 sm:mr-2 transition-opacity duration-200"></span>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 transition-colors duration-200 flex items-center group text-sm sm:text-base"
                >
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-rose-600 opacity-0 group-hover:opacity-100 mr-1.5 sm:mr-2 transition-opacity duration-200"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 transition-colors duration-200 flex items-center group text-sm sm:text-base"
                >
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-rose-600 opacity-0 group-hover:opacity-100 mr-1.5 sm:mr-2 transition-opacity duration-200"></span>
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/help"
                  className="text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 transition-colors duration-200 flex items-center group text-sm sm:text-base"
                >
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-rose-600 opacity-0 group-hover:opacity-100 mr-1.5 sm:mr-2 transition-opacity duration-200"></span>
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-6 text-gray-900 dark:text-gray-100">
              Contact Us
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start">
                <div className="p-1.5 sm:p-2 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 mr-2 sm:mr-3">
                  <MapPin size={16} className="sm:w-5 sm:h-5" />
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                  123 Auction Street, Cairo, Egypt
                </span>
              </li>
              <li className="flex items-center">
                <div className="p-1.5 sm:p-2 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 mr-2 sm:mr-3">
                  <Phone size={16} className="sm:w-5 sm:h-5" />
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                  +20 123 456 7890
                </span>
              </li>
              <li className="flex items-center">
                <div className="p-1.5 sm:p-2 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 mr-2 sm:mr-3">
                  <Mail size={16} className="sm:w-5 sm:h-5" />
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                  info@bemazady.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200/20 dark:border-gray-700/20 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
            &copy; {new Date().getFullYear()} BeMazady. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
