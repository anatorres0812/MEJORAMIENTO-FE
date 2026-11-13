import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">

      <!-- BIENVENIDA -->
      <header class="welcome-banner">
        <div class="welcome-text">
          <span class="welcome-label">BIENVENIDO</span>

          <h1>¡Hola, {{ nombre }}!</h1>

          <p *ngIf="rol === 'ESTUDIANTE'">
            ¡Qué alegría tenerte aquí! Sigue aprendiendo y alcanzando tus metas.
          </p>

          <p *ngIf="rol === 'PROFESOR'">
            Gestiona tus cursos y acompaña a tus estudiantes en su aprendizaje.
          </p>

          <p *ngIf="rol === 'ADMINISTRADOR'">
            Administra y organiza las actividades académicas de la institución.
          </p>

          <span class="role-badge">{{ rolTexto }}</span>
        </div>

        <!-- IMAGEN EXCLUSIVA DE MATEO -->
        <div class="welcome-image" *ngIf="esMateo">
          <img src="/4.jpeg?v=2" alt="Mateo" />
        </div>
      </header>

      <!-- ESTUDIANTE -->
      <section *ngIf="rol === 'ESTUDIANTE'">
        <div class="section-heading">
          <h2>Mi rincón de aprendizaje</h2>
          <p>Descubre tu progreso y continúa aprendiendo.</p>
        </div>

        <div class="cards-grid">
          <a
            class="dashboard-card grades-card"
            routerLink="/mis-calificaciones"
          >
            <div class="card-icon">📚</div>
            <h3>Mis calificaciones</h3>
            <p>Consulta tus notas y revisa tu progreso académico.</p>
            <span class="card-link">Ver calificaciones →</span>
          </a>

          <a
            class="dashboard-card profile-card"
            routerLink="/perfil"
          >
            <div class="card-icon">👤</div>
            <h3>Mi perfil</h3>
            <p>Consulta tu información personal.</p>
            <span class="card-link">Ver mi perfil →</span>
          </a>
        </div>

        <div class="motivation-box">
          <span class="motivation-icon">🌟</span>
          <div>
            <h3>¡Tú puedes lograrlo!</h3>
            <p>
              Cada día es una nueva oportunidad para aprender algo diferente
              y acercarte a tus sueños.
            </p>
          </div>
        </div>
      </section>

      <!-- DOCENTE -->
      <section *ngIf="rol === 'PROFESOR'">
        <div class="section-heading">
          <h2>Gestión docente</h2>
          <p>
            Organiza tus actividades y acompaña el progreso de tus estudiantes.
          </p>
        </div>

        <div class="cards-grid">
          <a class="dashboard-card students-card" routerLink="/estudiantes">
            <div class="card-icon">👨‍🎓</div>
            <h3>Estudiantes</h3>
            <p>Consulta la información de los estudiantes.</p>
            <span class="card-link">Ver estudiantes →</span>
          </a>

          <a class="dashboard-card courses-card" routerLink="/cursos">
            <div class="card-icon">📘</div>
            <h3>Cursos</h3>
            <p>Consulta y gestiona los cursos disponibles.</p>
            <span class="card-link">Ver cursos →</span>
          </a>

          <a class="dashboard-card grades-card" routerLink="/notas">
            <div class="card-icon">📝</div>
            <h3>Notas</h3>
            <p>Registra y consulta las calificaciones.</p>
            <span class="card-link">Gestionar notas →</span>
          </a>

          <a class="dashboard-card reports-card" routerLink="/reportes">
            <div class="card-icon">📊</div>
            <h3>Reportes</h3>
            <p>Consulta los reportes del rendimiento académico.</p>
            <span class="card-link">Ver reportes →</span>
          </a>

          <a class="dashboard-card profile-card" routerLink="/perfil">
            <div class="card-icon">👤</div>
            <h3>Mi perfil</h3>
            <p>Consulta tu información personal.</p>
            <span class="card-link">Ver mi perfil →</span>
          </a>
        </div>
      </section>

      <!-- ADMINISTRADOR -->
      <section *ngIf="rol === 'ADMINISTRADOR'">
        <div class="section-heading">
          <h2>Gestión académica</h2>
          <p>Administra los recursos y procesos de la institución educativa.</p>
        </div>

        <div class="cards-grid">
          <a class="dashboard-card teachers-card" routerLink="/profesores">
            <div class="card-icon">👩‍🏫</div>
            <h3>Profesores</h3>
            <p>Administra la información del personal docente.</p>
            <span class="card-link">Ver profesores →</span>
          </a>

          <a class="dashboard-card students-card" routerLink="/estudiantes">
            <div class="card-icon">🎓</div>
            <h3>Estudiantes</h3>
            <p>Consulta y administra los estudiantes.</p>
            <span class="card-link">Ver estudiantes →</span>
          </a>

          <a class="dashboard-card enrollments-card" routerLink="/matriculas">
            <div class="card-icon">📋</div>
            <h3>Matrículas</h3>
            <p>Gestiona las matrículas de los estudiantes.</p>
            <span class="card-link">Ver matrículas →</span>
          </a>

          <a class="dashboard-card classrooms-card" routerLink="/aulas">
            <div class="card-icon">🏫</div>
            <h3>Aulas</h3>
            <p>Administra las aulas de la institución.</p>
            <span class="card-link">Ver aulas →</span>
          </a>

          <a class="dashboard-card grades-card" routerLink="/grados">
            <div class="card-icon">📚</div>
            <h3>Grados</h3>
            <p>Gestiona los grados académicos.</p>
            <span class="card-link">Ver grados →</span>
          </a>

          <a class="dashboard-card periods-card" routerLink="/periodos">
            <div class="card-icon">📅</div>
            <h3>Periodos</h3>
            <p>Administra los periodos académicos.</p>
            <span class="card-link">Ver periodos →</span>
          </a>

          <a class="dashboard-card courses-card" routerLink="/cursos">
            <div class="card-icon">📖</div>
            <h3>Cursos</h3>
            <p>Consulta y administra los cursos.</p>
            <span class="card-link">Ver cursos →</span>
          </a>

          <a class="dashboard-card reports-card" routerLink="/reportes">
            <div class="card-icon">📈</div>
            <h3>Reportes</h3>
            <p>Consulta los reportes de gestión académica.</p>
            <span class="card-link">Ver reportes →</span>
          </a>

          <a class="dashboard-card profile-card" routerLink="/perfil">
            <div class="card-icon">👤</div>
            <h3>Mi perfil</h3>
            <p>Consulta tu información personal.</p>
            <span class="card-link">Ver mi perfil →</span>
          </a>
        </div>
      </section>

      <!-- PIE DE PÁGINA -->
      <footer class="dashboard-footer">
        <p>© 2026 TallerUp. Aprender, crecer y alcanzar nuevas metas.</p>
      </footer>

    </div>
  `,

  styles: [`
    :host {
      display: block;
      min-height: 100%;
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #263248;
    }

    * {
      box-sizing: border-box;
    }

    .dashboard {
      width: 100%;
      max-width: 1500px;
      margin: 0 auto;
      padding: 28px;
      background: #f5f7fc;
      min-height: 100%;
      border-radius: 18px;
    }

    /* BANNER DE BIENVENIDA */

    .welcome-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 28px;
      min-height: 245px;
      padding: 36px 42px;
      margin-bottom: 35px;
      overflow: hidden;
      position: relative;
      border-radius: 24px;
      background: linear-gradient(135deg, #5b5ce2 0%, #7774f5 55%, #a39bff 100%);
      color: #ffffff;
      box-shadow: 0 12px 30px rgba(91, 92, 226, 0.20);
    }

    .welcome-banner::before {
      content: '';
      position: absolute;
      width: 260px;
      height: 260px;
      right: 100px;
      top: -150px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.10);
    }

    .welcome-banner::after {
      content: '';
      position: absolute;
      width: 190px;
      height: 190px;
      right: -50px;
      bottom: -110px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.12);
    }

    .welcome-text {
      position: relative;
      z-index: 2;
      flex: 1;
    }

    .welcome-label {
      display: inline-block;
      margin-bottom: 12px;
      color: #e4e4ff;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 2.5px;
    }

    .welcome-text h1 {
      margin: 0 0 14px;
      color: #ffffff;
      font-size: clamp(28px, 4vw, 42px);
      font-weight: 800;
      line-height: 1.2;
    }

    .welcome-text p {
      max-width: 600px;
      margin: 0 0 20px;
      color: #f0efff;
      font-size: 15px;
      line-height: 1.8;
    }

    .role-badge {
      display: inline-block;
      padding: 8px 16px;
      border: 1px solid rgba(255, 255, 255, 0.35);
      border-radius: 30px;
      background: rgba(255, 255, 255, 0.16);
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    /* IMAGEN EXCLUSIVA DE MATEO */

    .welcome-image {
      position: relative;
      z-index: 2;
      flex-shrink: 0;
      width: 190px;
      height: 190px;
      overflow: hidden;
      border: 5px solid rgba(255, 255, 255, 0.75);
      border-radius: 50%;
      background: #ffffff;
      box-shadow: 0 10px 30px rgba(35, 32, 110, 0.25);
    }

    .welcome-image img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }

    /* ENCABEZADOS DE SECCIÓN */

    .section-heading {
      margin-bottom: 24px;
    }

    .section-heading h2 {
      margin: 0 0 8px;
      color: #252d48;
      font-size: 25px;
      font-weight: 800;
    }

    .section-heading p {
      margin: 0;
      color: #81899c;
      font-size: 14px;
      line-height: 1.7;
    }

    /* TARJETAS */

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 22px;
    }

    .dashboard-card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      min-height: 225px;
      padding: 25px;
      border: 1px solid #edf0f8;
      border-radius: 20px;
      background: #ffffff;
      color: #263248;
      text-decoration: none;
      box-shadow: 0 5px 18px rgba(36, 47, 87, 0.045);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    .dashboard-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 13px 28px rgba(36, 47, 87, 0.11);
    }

    .card-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 54px;
      height: 54px;
      margin-bottom: 18px;
      border-radius: 16px;
      font-size: 26px;
    }

    .dashboard-card h3 {
      margin: 0 0 10px;
      color: #29314a;
      font-size: 17px;
      font-weight: 800;
    }

    .dashboard-card p {
      flex: 1;
      margin: 0 0 18px;
      color: #838ba0;
      font-size: 13px;
      line-height: 1.8;
    }

    .card-link {
      font-size: 13px;
      font-weight: 800;
    }

    /* COLORES DE CADA TARJETA */

    .grades-card {
      border-top: 4px solid #7567ed;
    }

    .grades-card .card-icon {
      background: #efedff;
    }

    .grades-card .card-link {
      color: #7567ed;
    }

    .profile-card {
      border-top: 4px solid #e78cba;
    }

    .profile-card .card-icon {
      background: #fff0f7;
    }

    .profile-card .card-link {
      color: #d65b9a;
    }

    .students-card {
      border-top: 4px solid #36b8a0;
    }

    .students-card .card-icon {
      background: #e5faf5;
    }

    .students-card .card-link {
      color: #169b84;
    }

    .courses-card {
      border-top: 4px solid #f2b84b;
    }

    .courses-card .card-icon {
      background: #fff5dc;
    }

    .courses-card .card-link {
      color: #ce901d;
    }

    .reports-card {
      border-top: 4px solid #5ba6ef;
    }

    .reports-card .card-icon {
      background: #e9f4ff;
    }

    .reports-card .card-link {
      color: #3389d7;
    }

    .teachers-card {
      border-top: 4px solid #8b79ed;
    }

    .teachers-card .card-icon {
      background: #f0edff;
    }

    .teachers-card .card-link {
      color: #7965d7;
    }

    .enrollments-card {
      border-top: 4px solid #f08c69;
    }

    .enrollments-card .card-icon {
      background: #fff0e9;
    }

    .enrollments-card .card-link {
      color: #df7048;
    }

    .classrooms-card {
      border-top: 4px solid #4eb8d0;
    }

    .classrooms-card .card-icon {
      background: #e5f8fc;
    }

    .classrooms-card .card-link {
      color: #2396b2;
    }

    .periods-card {
      border-top: 4px solid #64b87c;
    }

    .periods-card .card-icon {
      background: #e8f8ec;
    }

    .periods-card .card-link {
      color: #3b9a57;
    }

    /* MENSAJE MOTIVADOR */

    .motivation-box {
      display: flex;
      align-items: center;
      gap: 18px;
      margin-top: 28px;
      padding: 24px 27px;
      border: 1px solid #f6e6a8;
      border-radius: 18px;
      background: linear-gradient(110deg, #fff9e6, #fffdf5);
    }

    .motivation-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 55px;
      height: 55px;
      border-radius: 16px;
      background: #ffefbd;
      font-size: 28px;
    }

    .motivation-box h3 {
      margin: 0 0 7px;
      color: #8b6917;
      font-size: 17px;
      font-weight: 800;
    }

    .motivation-box p {
      margin: 0;
      color: #9a8758;
      font-size: 13px;
      line-height: 1.8;
    }

    /* PIE DE PÁGINA */

    .dashboard-footer {
      margin-top: 38px;
      padding: 20px 10px 5px;
      border-top: 1px solid #e7eaf2;
      text-align: center;
    }

    .dashboard-footer p {
      margin: 0;
      color: #9aa1b2;
      font-size: 12px;
      line-height: 1.7;
    }

    /* TABLETS */

    @media (max-width: 1000px) {
      .dashboard {
        padding: 22px;
      }

      .welcome-banner {
        padding: 30px;
      }

      .welcome-image {
        width: 155px;
        height: 155px;
      }

      .cards-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
      }
    }

    /* CELULARES */

    @media (max-width: 600px) {
      .dashboard {
        padding: 14px;
        border-radius: 12px;
      }

      .welcome-banner {
        flex-direction: column;
        align-items: flex-start;
        gap: 24px;
        padding: 25px 22px;
        border-radius: 19px;
      }

      .welcome-text h1 {
        font-size: 29px;
      }

      .welcome-text p {
        font-size: 14px;
      }

      .welcome-image {
        align-self: center;
        width: 140px;
        height: 140px;
      }

      .section-heading h2 {
        font-size: 21px;
      }

      .cards-grid {
        grid-template-columns: 1fr;
        gap: 15px;
      }

      .dashboard-card {
        min-height: 200px;
        padding: 22px;
      }

      .motivation-box {
        align-items: flex-start;
        padding: 19px;
      }

      .motivation-icon {
        width: 44px;
        height: 44px;
        font-size: 23px;
      }
    }
  `]
})
export class DashboardComponent {
  constructor(public auth: AuthService) {}

  get rol(): string | null {
    return this.auth.getRol();
  }

  get nombre(): string {
    const usuario = this.auth.usuario();

    return usuario?.nombreCompleto
      || [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ')
      || usuario?.username
      || 'Usuario';
  }

  get rolTexto(): string {
    switch (this.rol) {
      case 'ESTUDIANTE':
        return '🎓 Estudiante';

      case 'PROFESOR':
        return '👩‍🏫 Docente';

      case 'ADMINISTRADOR':
        return '⚙️ Administrador';

      default:
        return 'Usuario';
    }
  }

  get esMateo(): boolean {
    const usuario = this.auth.usuario();

    const identificadores = [
      usuario?.nombreCompleto,
      usuario?.nombre,
      usuario?.username
    ];

    return this.rol === 'ESTUDIANTE'
      && identificadores.some(
        valor => valor?.trim().toLowerCase() === 'mateo'
      );
  }
}