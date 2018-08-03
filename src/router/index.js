import Vue from 'vue'
import Router from 'vue-router'
import Cadastro from '@/components/Cadastro'

Vue.use(Router)

export default new Router({
	// mode: 'history',
	routes: [		
		{
			path: '/',
			name: 'Cadastro',
			component: Cadastro
		}
	]
})
