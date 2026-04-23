# Hotel Project
# PyMySQL faqat MySQL ishlatilganda kerak
try:
    import pymysql
    pymysql.install_as_MySQLdb()
except ImportError:
    pass
