import { FaGithub, FaXTwitter, FaLinkedinIn } from 'react-icons/fa6'
import { TbBrain } from 'react-icons/tb'
import { Link } from 'react-router-dom'

const socialLinks = [
  { label: 'GitHub',   Icon: FaGithub   },
  { label: 'Twitter',  Icon: FaXTwitter  },
  { label: 'LinkedIn', Icon: FaLinkedinIn },
]

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-white/5 bg-white dark:bg-dark-800/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
                <TbBrain className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold dark:text-white text-gray-900">
                Intervue<span className="text-cyan-500">.AI</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              Your AI-powered interview preparation companion. Master technical interviews with personalized, adaptive practice.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {socialLinks.map(({ label, Icon }) => (
                <a key={label} href="#" aria-label={label} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center
                  text-gray-500 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-gray-200 dark:hover:bg-white/10
                  transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Platform</h4>
            <ul className="space-y-2">
              {['Dashboard', 'Take Interview', 'Resume Analysis', 'Feedback Reports'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Account</h4>
            <ul className="space-y-2">
              {[['Login', '/login'], ['Sign Up', '/signup'], ['Privacy Policy', '#'], ['Terms of Service', '#']].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-gray-500 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © 2025 Intervue.AI. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Built with ❤️ for developers
          </p>
        </div>
      </div>
    </footer>
  )
}
