import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { LoadingSpinner } from './LoadingSpinner'

export function PageLoader() {
  const { t } = useTranslation()

  return (
    <motion.div
      className="flex items-center justify-center py-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <LoadingSpinner size="xl" label={t('common.loading')} />
    </motion.div>
  )
}