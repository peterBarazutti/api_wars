import connection


@connection.connection_handler
def add_new_user(cursor, new_username, new_password):
    """
    :param cursor:
    :param username:
    :param password:
    :return:
    """
    cursor.execute("""
                    INSERT INTO users_table (username, password) 
                    VALUES (%(username)s, %(password)s);
                    """,
                   {'username': new_username, 'password': new_password}
                   )
    return True


@connection.connection_handler
def get_hashed_password(cursor, username):
    cursor.execute("""
                        SELECT password
                        FROM users_table
                        WHERE username= %(username)s;
                        """,
                   {'username': username})
    password = cursor.fetchone()
    return password

@connection.connection_handler
def get_user_id(cursor, input_username):
    cursor.execute("""
                    SELECT id
                    FROM users_table
                    WHERE username=%(uname)s;
                    """,
                   {'uname': input_username})
    user_id = cursor.fetchone()
    return user_id


@connection.connection_handler
def add_vote(cursor, planet_name, planet_id, user_id, submission_time):
    cursor.execute("""
                    INSERT INTO planetvotes (planet_id, planet_name, user_id, submission_time)
                    VALUES (%(planet_id)s, %(planet_name)s, %(user_id)s, %(submission_time)s);
                    """,
                   {'planet_id': planet_id, 'planet_name': planet_name, 'user_id': user_id, 'submission_time': submission_time})
    return True


@connection.connection_handler
def get_vote_stats(cursor):
    cursor.execute("""
                    SELECT COUNT(id), planet_name
                    FROM planetvotes 
                    GROUP BY planet_name
                    """)
    vote_stats = cursor.fetchall()
    return vote_stats