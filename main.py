import data_manager, utility
import psycopg2
from time import time
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import urllib
import os

app = Flask(__name__)

app.secret_key = 'kifli'

urllib.parse.uses_netloc.append('postgres')
url = urllib.parse.urlparse(os.environ.get('DATABASE_URL'))
connection = psycopg2.connect(
    database=url.path[1:],
    user=url.username,
    password=url.password,
    host=url.hostname,
    port=url.port
)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/register', methods=['GET', 'POST'])
def register_user():
    if request.method == "POST":
        input_username = request.form['username']
        input_password = request.form['password']
        input_password_repeated = request.form['password_repeat']
        if input_password != input_password_repeated:
            return redirect(url_for("register_user"))
        else:
            hashed_password = utility.hash_password(input_password)
            try:
                data_manager.add_new_user(input_username, hashed_password)
                return render_template('index.html', username=input_username)
            except psycopg2.IntegrityError:
                return redirect(url_for("register_user"))
    else:
        return render_template('registration.html')


@app.route('/login', methods=['GET', 'POST'])
def user_login():
    if request.method == "POST":
        input_username = request.form['username']
        input_password = request.form['password']
        stored_password = data_manager.get_hashed_password(input_username)
        if stored_password is None:
            return redirect(url_for('user_login'))
        isPasswordVerified = utility.verify_password(input_password, stored_password['password'])
        if isPasswordVerified:
            session['username'] = input_username
            session['id'] = data_manager.get_user_id(input_username)['id']
            return render_template('index.html', username=input_username)
        else:
            return redirect(url_for('user_login'))

    else:
        return render_template('login.html')


@app.route('/logout')
def logout():
    session.pop('username')
    return redirect(url_for('index'))


@app.route('/vote-planet', methods=['GET', 'POST'])
def vote_planet():
    username = session.get('username')
    user_id = session.get('id')
    timestamp = int(time())
    submission_time = datetime.fromtimestamp(timestamp)
    planet_id = request.form['planet_id']
    planet_name = request.form['planet_name']
    data_manager.add_vote(planet_name, planet_id, user_id, submission_time)
    return 'ok'


@app.route('/vote-stats')
def vote_statistics():
    vote_stats = data_manager.get_vote_stats()
    return {'planet_name': 'Geonosis',
                   'count': 1}


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=8000,
        debug=True,
    )