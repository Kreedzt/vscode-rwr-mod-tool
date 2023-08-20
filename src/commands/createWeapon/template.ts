import * as fsPromise from 'fs/promises';
import * as path from 'path';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { IWeaponXML } from './types';

const TEMPLATE_CONTENT = `<?xml version="1.0" encoding="utf-8"?>	
<weapon 
drop_count_factor_on_death="0" 
drop_count_factor_on_player_death="1.0"
time_to_live_out_in_the_open="900"
player_death_drop_owner_lock_time="600"
key="normal.weapon" 
on_ground_up="0 0 1" 
> 
    <specification 	
    slot="0" 	
    retrigger_time="0.1" 
	last_burst_retrigger_time="1"
    accuracy_factor="1.0" 
	spread_range="0.1"
	stance_accuracy_rate="1.0"
    sustained_fire_grow_step="0.6" 
    sustained_fire_diminish_rate="1.3" 
    magazine_size="300" 
    can_shoot_standing="1" 
    can_shoot_crouching="1" 
	can_shoot_prone="1"	
    suppressed="0" 
	class="0" 
    name="normal weapon" 
	sight_range_modifier="1.0" 
	burst_shots="1" 
    projectiles_per_shot="1" 
    projectile_speed="150.0"
	barrel_offset="1.0" 
	carry_in_two_hands="1" 
	stab_enabled="0" 
	stab_range="0" 
	use_basic_muzzle_smoke_effect="0"
	/> 
	<!--class 0全自动 4半自动 2栓动 3特殊（可做一次性武器）5近程特殊（如部署沙包）-->
	
	<!--武器模型和HUD-->
	<weak_hand_hold offset="0.0" /> <!--模型X轴偏移-->
	<model filename="ref_weapon_model.xml" /> 
    <model mesh_filename="" texture_filename="" /> <!--调用mesh模型-->
    <addon_model filename="" /> <!--附加模型，固定绑骨到肩膀-->
    <hud_icon filename="ref_weapon_hud.png" /> <!--武器为110x220像素，投掷物为110x110-->
	
	<!--多模式-->
    <next_in_chain key="ref.weapon" share_ammo="0" /> 

	<!--武器动作，必须指定recoil和reload动作，部分动作留空会默认调用常规双手武器动作或者无动作-->
    <animation key="recoil" ref="12" /> <!--后坐力动作，半身动作-->
    <animation key="cycle" ref="28" /> <!--拉栓动作，武器固定脱手-->
    <animation key="reload" ref="33" />	<!--换弹动作，半身动作-->
    <animation state_key="hold" animation_key="" /><!--站姿静止动作，全身动作-->
	<animation state_key="hold_on_wall"  animation_key="" /><!--架枪动作，全身动作-->
    <animation state_key="still_against_wall" animation_key="" /><!--靠墙动作，全身动作-->
    <animation state_key="hold_casual" animation_key="" /><!--闲置动作，全身动作-->
	<animation state_key="running" animation_key="" /><!--全身动作-->
	<animation state_key="walking" animation_key="" /><!--按shift时候的静步前进动作，全身动作-->
    <animation state_key="walking_backwards" animation_key="" /><!--全身动作-->
    <animation state_key="crouching" animation_key="" /><!--蹲姿静止动作，全身动作-->
	<animation state_key="crouch_moving" animation_key="" /><!--全身动作-->
	<animation state_key="crouch_moving_backwards" animation_key="" /><!--全身动作-->
    <animation state_key="prone_still" animation_key="" /><!--全身动作-->
	<animation state_key="prone_moving" animation_key="" /><!--全身动作-->
	<animation state_key="stabbing" animation_key="pistol whip 3" /><!--半身动作，武器可设置脱手-->

	<!--武器音频-->
    <sound key="effect" fileref="" pitch_variety="0" volume="1.0" /><!--额外音频接口，在动作中调用，volume为音频大小倍率-->
    <sound key="fire" fileref="ak47_shot.wav" pitch_variety="0.05" volume="1.0" /><!--pitch_variety为音调随机变化范围，自动武器常用-->
    <sound key="dry_fire" fileref="hd_dryfire.wav" pitch_variety="0.05" volume="1.0" /><!--空弹射击扳机音效-->
	<sound key="stab" fileref="grenade_throw1.wav" pitch_variety="0.03" volume="1" /><!--stab_enabled为1时生效该三个接口-->
	<sound key="stab_hit" fileref="impact_whip.wav" pitch_variety="0.05" volume="1" />
	<sound key="stab_hit_any" fileref="whip_hit.wav" pitch_variety="0.05" volume="1" />
    <sound key="magazine_out" fileref="hd_mag_out.wav" /><!--动作中out的value为0-->
    <sound key="magazine_in" fileref="hd_mg94_mag_in.wav" /><!--动作中in的value为1-->
    <sound key="cycle" fileref="rifle_chamber.wav" /><!--配合与cycle动作，固定播放-->
    <sound key="cycle_out" fileref="sniper_cycle_out.wav" /><!--动作中out的value为0-->
    <sound key="cycle_in" fileref="sniper_cycle_in.wav" /><!--动作中in的value为1-->
    <sound key="last_ammo" fileref="hd_lastammo_01.wav" /><!--最后一发子弹射击的额外音效，可多个混合随机播放-->
    <sound key="last_ammo" fileref="hd_lastammo_02.wav" /><!--最后一发子弹射击的额外音效，可多个混合随机播放-->
    <sound key="last_ammo" fileref="hd_lastammo_03.wav" /><!--最后一发子弹射击的额外音效，可多个混合随机播放-->
    <sound key="last_ammo" fileref="hd_lastammo_04.wav" /><!--最后一发子弹射击的额外音效，可多个混合随机播放-->
	<sound class="impact" fileref="rifle_drop.wav" /><!--武器落地音效-->

	<!--武器携带量，必须从value=0开始设置，value单位为万xp-->
	<capacity value="0" source="rank" source_value="0.0" />
	<capacity value="1" source="rank" source_value="0.0" />
	
	<!--军械库相关-->
    <commonness value="1" can_respawn_with="1" in_stock="1" /> 
    <inventory encumbrance="10.0" price="0.0" /> <!--武器重量和价格，实际负重为两倍encumbrance值-->
    
	<!--弹头相关，此处代码优先级高，会覆写file指定的文件-->
    <projectile file="bullet.projectile" pulldown_in_air="4" can_be_detected_by_footmen="1" 
	time_to_live="2" can_be_detected_by_driver="1" can_be_disarmed="0" name="normal"> 
	
		<!--
		<result class="blast" radius="6.8" damage="0.2" push="0" decal="0" character_state="death"  />
		<result class="spawn" instance_class="projectile" instance_key="rx1_railgun_ap.projectile" 
		min_amount="1" max_amount="1" offset="0 0 0" position_spread="0 0" direction_spread="0 0" />	
			offset"x y z 生成位置偏差" 
			position_spread="水平面随机生成位置 竖直面随机生成位置" 
			direction_spread="圆环方向随机散射速度（正负不影响） 垂直方向随机速度（正向上）数值大小敏感"
		<result class="hit" kill_probability="0.88" 
		kill_probability_offset_on_successful_hit="0"
		kill_decay_start_time="0.48" kill_decay_end_time="0.70" />
		-->
		<result class="blast" radius="1.0" damage="0.2" push="0" decal="0" character_state="death"  />
		<trigger class="impact" time_to_live="1.5"  /><!--class为time时，ttl生效；遥控为remote_detonate-->
		<rotation class="motion" /><!--参数：motion、random-->
	
		<!--命中音效-->
		<sound class="result" key="other" fileref="rifle_drop.wav" pitch_variety="0.03" volume="1.0" />
		
		<!--命中特效-->
		<!--
		<effect class="result" key="terrain" ref="" lighting="0"/>
		<effect class="activated" ref="" />
		-->
		<effect class="result" key="terrain" ref="general_weapon_result_hitspot" lighting="0"/>
		<effect class="activated" ref="general_weapon_activated_bullet_light" lighting="0"/>

		<!--copy组，需要命中不同对象产生不同音效或特效可修改这里-->
		<sound class="result" key="terrain" copy="other" />
		<sound class="result" key="static_object" copy="other" />
		<sound class="result" key="vehicle" copy="other" />
		<sound class="result" key="character" copy="other" />
		<sound class="result" key="shield" copy="other" />
		<effect class="result" key="other" copy="terrain"/>
		<effect class="result" key="static_object" copy="terrain" />
		<effect class="result" key="character" copy="terrain" />
		<effect class="result" key="shield" copy="terrain" />			
		<effect class="result" key="vehicle" copy="terrain" />			
		<effect class="result" key="vehicle" tag="sandbag" copy="terrain" use_surface_color="0" />
		<effect class="result" key="vehicle" tag="deco_car" copy="terrain" use_surface_color="0" />
		<effect class="result" key="vehicle" tag="metal_thin" copy="terrain" use_surface_color="0" />
		<effect class="result" key="vehicle" tag="metal_heavy" copy="terrain" use_surface_color="0" />
		<effect class="result" key="vehicle" tag="metal_dumpster" copy="terrain" use_surface_color="0" />
		
		<!--尾迹组-->
		<trail probability="1" key="normal_trail"/>	
    </projectile>
	
	<!--枪口特效-->
	<effect class="muzzle" ref="general_weapon_muzzle_crossfire" lighting="0"/> 
	<effect class="muzzle" ref="general_weapon_muzzle_crossfire_smoke" lighting="0"/> 
	
	<!--雷鸣弹道
    <ballistics 
    curve_height="16" 
    near_far_distance="0" 
    speed_estimation_near="0" 
    speed_estimation_far="58" 
    max_speed="58" 
    randomness="0" 
    tweak_factor="1.48" /> 
	该弹道适配弹头参数：pulldon_in_air="48"
	-->
	
	<!--姿态精度-->
    <stance state_key="running" accuracy="1" /> 
    <stance state_key="walking" accuracy="1" />
	<stance state_key="standing" accuracy="1" />
	<stance state_key="crouching" accuracy="1" />
    <stance state_key="crouch_moving" accuracy="1" />
    <stance state_key="prone" accuracy="1" /> 
    <stance state_key="prone_moving" accuracy="1" />
    <stance state_key="over_wall" accuracy="1" />     
     
	<!--附加属性-->
    <modifier class="speed" value="0.0" /> 
    <modifier class="hit_success_probability" value="0.0" /><!--正值减少玩家抗致死率-->
    <modifier class="detectability" value="0.0" />	<!--正值减少玩家隐蔽-->
		
</weapon>`;

export class TemplateService {
	private static cls: TemplateService;

	static getCls() {
		if (!TemplateService.cls) {
			TemplateService.cls = new TemplateService();
		}

		return TemplateService.cls;
	}

	private template: string = TEMPLATE_CONTENT;
	private builder: XMLBuilder = new XMLBuilder({
        ignoreAttributes: false,
        commentPropName: 'comment',
        // 4 spaces
        indentBy: '    ',
        suppressUnpairedNode: false,
        format: true,
        suppressEmptyNode: true
    });
	private parser: XMLParser = new XMLParser({
        parseAttributeValue: true,
        ignoreAttributes: false,
        allowBooleanAttributes: true,
        parseTagValue: true,
        commentPropName: 'comment',
        numberParseOptions: {
            hex: true,
            leadingZeros: false,
            eNotation: true
        },
    });
	private parserRes: IWeaponXML | null = null;

	loadTemplate() {
		this.parserRes = this.parser.parse(this.template) as IWeaponXML;
		console.log('Touch this.parserRes');
		console.log(this.parserRes);
	}

	getXMLContent(params: {
		weaponName: string;
	}): string {
        this.loadTemplate();
        if (!this.parserRes) {
            return '';
        }

		// TODO: Error: animte tag not effect
        // const newWeapon: IWeaponXML = {
        //     ...this.parserRes,
        //     weapon: {
        //         ...this.parserRes.weapon,
        //         '@_key': params.weaponName
        //     }
        // }

		// return this.builder.build(newWeapon);

		const newWeaponStr = this.template.replace('key="normal.weapon"', `key="${params.weaponName}.weapon"`);

		return newWeaponStr;
	}
}